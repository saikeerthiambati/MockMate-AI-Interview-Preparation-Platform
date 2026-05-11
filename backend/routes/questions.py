from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import sqlite3, random
from database import DB_PATH
from auth_utils import get_current_user, require_admin

router = APIRouter()

SUBJECTS = ['Java', 'Python', 'C/C++', 'DSA', 'Web Dev', 'Backend', 'Database',
            'System Design', 'DevOps', 'Security', 'General Programming']

# ── TECHNICAL INTERVIEW QUESTIONS fallback bank ──
TECHNICAL_INTERVIEW_BANK = {
    "Java": [
        {"question": "Explain the difference between HashMap and ConcurrentHashMap.", "answer": "HashMap is not thread-safe while ConcurrentHashMap is thread-safe. ConcurrentHashMap uses segment locking for better concurrency.", "difficulty": "Medium"},
        {"question": "What is the difference between abstract class and interface in Java?", "answer": "Abstract class can have concrete methods and state, interface only has abstract methods (before Java 8). A class can implement multiple interfaces but extend only one abstract class.", "difficulty": "Medium"},
        {"question": "Explain Java memory model - heap vs stack.", "answer": "Stack stores method calls and local variables. Heap stores objects. Stack is thread-specific, heap is shared.", "difficulty": "Medium"},
        {"question": "What is garbage collection in Java?", "answer": "Automatic memory management that removes unreferenced objects from heap memory using algorithms like Mark and Sweep.", "difficulty": "Easy"},
        {"question": "What are the SOLID principles?", "answer": "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion - principles for clean OOP design.", "difficulty": "Hard"},
        {"question": "Explain multithreading in Java with an example.", "answer": "Multithreading allows concurrent execution. Java threads created via Thread class or Runnable interface. synchronized keyword prevents race conditions.", "difficulty": "Hard"},
        {"question": "What is the difference between checked and unchecked exceptions?", "answer": "Checked exceptions must be handled at compile time (IOException). Unchecked exceptions occur at runtime (NullPointerException).", "difficulty": "Easy"},
        {"question": "What is Java Stream API?", "answer": "Stream API processes collections of objects in a functional style. Supports filter, map, reduce operations for clean data processing.", "difficulty": "Medium"},
    ],
    "Python": [
        {"question": "What is the difference between a list and a tuple in Python?", "answer": "Lists are mutable (can be changed), tuples are immutable. Tuples are faster and used for fixed data.", "difficulty": "Easy"},
        {"question": "Explain decorators in Python.", "answer": "Decorators are functions that wrap another function to extend behavior without modifying it. Used with @syntax.", "difficulty": "Medium"},
        {"question": "What is GIL in Python and how does it affect multithreading?", "answer": "Global Interpreter Lock allows only one thread to execute Python code at a time. This limits true parallelism in CPU-bound tasks.", "difficulty": "Hard"},
        {"question": "What are generators in Python?", "answer": "Generators use yield to return values lazily one at a time, saving memory. They are iterators that generate values on demand.", "difficulty": "Medium"},
        {"question": "Explain list comprehension vs map/filter.", "answer": "List comprehension is more readable Pythonic way to create lists. map/filter are functional approaches. Both achieve similar results.", "difficulty": "Easy"},
        {"question": "What is the difference between deep copy and shallow copy?", "answer": "Shallow copy copies object references, deep copy recursively copies all nested objects. Use copy.deepcopy() for deep copy.", "difficulty": "Medium"},
        {"question": "What are Python's *args and **kwargs?", "answer": "*args passes variable number of positional arguments as tuple. **kwargs passes variable keyword arguments as dictionary.", "difficulty": "Easy"},
        {"question": "Explain OOP concepts in Python.", "answer": "Python supports encapsulation, inheritance, polymorphism, and abstraction. Uses class keyword, self parameter, and __init__ constructor.", "difficulty": "Medium"},
    ],
    "DSA": [
        {"question": "Explain the difference between BFS and DFS.", "answer": "BFS explores level by level using a queue, good for shortest path. DFS goes deep first using stack/recursion, good for cycle detection.", "difficulty": "Medium"},
        {"question": "What is dynamic programming and when do you use it?", "answer": "DP solves problems by breaking into overlapping subproblems and storing results. Used when problem has optimal substructure and overlapping subproblems.", "difficulty": "Hard"},
        {"question": "Explain time and space complexity of merge sort.", "answer": "Merge sort has O(n log n) time complexity always. Space complexity is O(n) for auxiliary array. Stable sorting algorithm.", "difficulty": "Medium"},
        {"question": "What is a hash table and how does it handle collisions?", "answer": "Hash table maps keys to values using hash function. Collisions handled by chaining (linked lists) or open addressing (probing).", "difficulty": "Medium"},
        {"question": "Explain binary search and its requirements.", "answer": "Binary search finds element in sorted array in O(log n) time by repeatedly dividing search space in half. Requires sorted array.", "difficulty": "Easy"},
        {"question": "What is a balanced binary search tree?", "answer": "BST where height difference between left and right subtrees is at most 1. Examples: AVL tree, Red-Black tree. Ensures O(log n) operations.", "difficulty": "Hard"},
        {"question": "Difference between stack and queue with real world examples.", "answer": "Stack is LIFO - like a stack of plates. Queue is FIFO - like a waiting line. Stack used in function calls, queue in scheduling.", "difficulty": "Easy"},
        {"question": "What is the two pointer technique?", "answer": "Two pointer uses two indices to traverse array simultaneously. Used for problems like finding pair with sum, removing duplicates. Reduces O(n²) to O(n).", "difficulty": "Medium"},
    ],
    "Web Dev": [
        {"question": "Explain the difference between REST and GraphQL.", "answer": "REST uses multiple endpoints with fixed data shapes. GraphQL uses single endpoint where client specifies exact data needed. GraphQL avoids over/under-fetching.", "difficulty": "Medium"},
        {"question": "What is the virtual DOM in React?", "answer": "Virtual DOM is in-memory representation of real DOM. React compares virtual DOM with previous version (diffing) and only updates changed parts (reconciliation).", "difficulty": "Medium"},
        {"question": "Explain HTTP methods and when to use each.", "answer": "GET retrieves data, POST creates, PUT updates completely, PATCH updates partially, DELETE removes. GET and DELETE are idempotent.", "difficulty": "Easy"},
        {"question": "What is CORS and how do you handle it?", "answer": "Cross-Origin Resource Sharing restricts web pages from making requests to different domain. Handled by setting Access-Control-Allow-Origin headers on server.", "difficulty": "Medium"},
        {"question": "Explain useState and useEffect hooks in React.", "answer": "useState manages component state. useEffect handles side effects like API calls, subscriptions. Runs after render, can return cleanup function.", "difficulty": "Medium"},
        {"question": "What is CSS specificity?", "answer": "Specificity determines which CSS rule applies. Inline > ID > Class > Element. Calculated as (inline, id, class, element) score.", "difficulty": "Easy"},
        {"question": "What is async/await and how does it work?", "answer": "async/await is syntactic sugar over Promises for cleaner async code. await pauses execution until Promise resolves. Must be inside async function.", "difficulty": "Medium"},
        {"question": "Explain the event loop in JavaScript.", "answer": "Event loop processes call stack and callback queue. When call stack is empty, it picks callbacks from queue. Enables non-blocking I/O in single-threaded JS.", "difficulty": "Hard"},
    ],
    "Backend": [
        {"question": "Explain microservices vs monolithic architecture.", "answer": "Monolithic is single deployable unit, simple but hard to scale. Microservices are independent services, complex but scalable and maintainable.", "difficulty": "Hard"},
        {"question": "What is REST API design best practices?", "answer": "Use proper HTTP methods, meaningful URLs with nouns not verbs, proper status codes, versioning, pagination, authentication, and documentation.", "difficulty": "Medium"},
        {"question": "How does JWT authentication work?", "answer": "JWT has header, payload, signature. Server creates token on login, client sends in requests. Server verifies signature without database lookup.", "difficulty": "Medium"},
        {"question": "What is the difference between SQL and NoSQL databases?", "answer": "SQL is relational with fixed schema, good for complex queries. NoSQL is flexible schema, good for scale and unstructured data.", "difficulty": "Easy"},
        {"question": "Explain caching strategies.", "answer": "Cache-aside loads data on miss. Write-through writes to cache and DB. Write-behind writes to cache then async to DB. Use Redis/Memcached.", "difficulty": "Hard"},
        {"question": "What is database indexing?", "answer": "Index is data structure that speeds up data retrieval. B-tree for range queries, hash for exact match. Trade-off: faster reads, slower writes.", "difficulty": "Medium"},
    ],
    "Database": [
        {"question": "Explain ACID properties in databases.", "answer": "Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions don't interfere), Durability (committed data persists).", "difficulty": "Medium"},
        {"question": "What is database normalization?", "answer": "Process of organizing data to reduce redundancy. 1NF removes duplicates, 2NF removes partial dependencies, 3NF removes transitive dependencies.", "difficulty": "Hard"},
        {"question": "Explain SQL joins with examples.", "answer": "INNER JOIN returns matching rows. LEFT JOIN returns all left rows. RIGHT JOIN returns all right rows. FULL OUTER JOIN returns all rows from both.", "difficulty": "Medium"},
        {"question": "What is an index and when should you use it?", "answer": "Index speeds up SELECT queries but slows INSERT/UPDATE. Use on columns in WHERE, JOIN, ORDER BY clauses. Avoid on low-cardinality columns.", "difficulty": "Medium"},
        {"question": "What is the difference between clustered and non-clustered index?", "answer": "Clustered index determines physical order of data (one per table). Non-clustered is separate structure pointing to data rows (multiple allowed).", "difficulty": "Hard"},
    ],
    "System Design": [
        {"question": "How would you design a URL shortener like bit.ly?", "answer": "Use hash function to generate short code, store mapping in DB with cache (Redis). Handle redirects, expiry, analytics. Consider scale with load balancer.", "difficulty": "Hard"},
        {"question": "Explain horizontal vs vertical scaling.", "answer": "Vertical scaling adds more power to existing machine. Horizontal scaling adds more machines. Horizontal is more flexible but needs load balancing.", "difficulty": "Easy"},
        {"question": "What is a load balancer and how does it work?", "answer": "Load balancer distributes traffic across servers. Uses algorithms like round-robin, least connections. Provides high availability and scalability.", "difficulty": "Medium"},
        {"question": "Explain CAP theorem.", "answer": "Distributed system can only guarantee 2 of 3: Consistency, Availability, Partition Tolerance. During partition must choose between consistency and availability.", "difficulty": "Hard"},
        {"question": "What is a message queue and when would you use it?", "answer": "Message queue enables async communication between services. Use for decoupling, handling traffic spikes, background jobs. Examples: RabbitMQ, Kafka.", "difficulty": "Medium"},
    ],
    "DevOps": [
        {"question": "Explain the CI/CD pipeline.", "answer": "CI automates build and test on code commit. CD automates deployment to staging/production. Reduces manual errors and enables frequent releases.", "difficulty": "Medium"},
        {"question": "What is Docker and why is it used?", "answer": "Docker containers package app with dependencies for consistent environments. Lightweight vs VMs. Solves 'works on my machine' problem.", "difficulty": "Easy"},
        {"question": "Explain Kubernetes architecture.", "answer": "K8s has master (API server, scheduler, etcd) and worker nodes (kubelet, pods). Manages containerized apps at scale with auto-scaling and self-healing.", "difficulty": "Hard"},
        {"question": "What is infrastructure as code?", "answer": "Managing infrastructure through code instead of manual processes. Tools like Terraform, Ansible. Enables version control, reproducibility, automation.", "difficulty": "Medium"},
    ],
    "Security": [
        {"question": "What is SQL injection and how to prevent it?", "answer": "SQL injection inserts malicious SQL code via input. Prevent with parameterized queries, prepared statements, input validation, and ORM usage.", "difficulty": "Medium"},
        {"question": "Explain XSS attack and prevention.", "answer": "Cross-site scripting injects malicious scripts into web pages. Prevent with input sanitization, output encoding, Content Security Policy headers.", "difficulty": "Medium"},
        {"question": "What is HTTPS and how does TLS work?", "answer": "TLS encrypts communication with asymmetric key exchange then symmetric encryption. Certificate Authority verifies server identity. Prevents man-in-middle attacks.", "difficulty": "Hard"},
        {"question": "Explain authentication vs authorization.", "answer": "Authentication verifies identity (who are you). Authorization verifies permissions (what can you do). JWT handles both - identity in payload, roles for permissions.", "difficulty": "Easy"},
    ],
    "General Programming": [
        {"question": "What are the four pillars of OOP?", "answer": "Encapsulation bundles data and methods. Abstraction hides complexity. Inheritance shares behavior between classes. Polymorphism allows same interface for different types.", "difficulty": "Easy"},
        {"question": "Explain the difference between compiled and interpreted languages.", "answer": "Compiled languages convert to machine code before execution (C++, Java). Interpreted execute line by line (Python, JavaScript). Compiled is faster, interpreted is more flexible.", "difficulty": "Easy"},
        {"question": "What is recursion and when should you use it?", "answer": "Recursion is function calling itself. Use for tree traversal, divide-and-conquer. Needs base case. Can cause stack overflow. Sometimes less efficient than iteration.", "difficulty": "Medium"},
        {"question": "What is the difference between synchronous and asynchronous programming?", "answer": "Synchronous blocks execution until complete. Asynchronous allows other code to run while waiting. Async is better for I/O-bound tasks like API calls.", "difficulty": "Medium"},
    ],
}

MCQ_BANK = {
    "Java": [
        {"question": "What is a checked exception in Java?", "option_a": "An exception caught at runtime", "option_b": "An exception verified at compile time", "option_c": "An error in syntax", "option_d": "A warning", "correct_option": "B", "difficulty": "Medium"},
        {"question": "What is autoboxing in Java?", "option_a": "Converting object to primitive", "option_b": "Converting primitive to wrapper object", "option_c": "Casting between types", "option_d": "Creating arrays automatically", "correct_option": "B", "difficulty": "Easy"},
        {"question": "Which keyword is used to prevent inheritance in Java?", "option_a": "static", "option_b": "private", "option_c": "final", "option_d": "abstract", "correct_option": "C", "difficulty": "Easy"},
        {"question": "What is the purpose of the 'synchronized' keyword?", "option_a": "To speed up execution", "option_b": "To prevent multiple threads from accessing a method simultaneously", "option_c": "To sort collections", "option_d": "To handle exceptions", "correct_option": "B", "difficulty": "Hard"},
        {"question": "Which collection is thread-safe in Java?", "option_a": "ArrayList", "option_b": "HashMap", "option_c": "ConcurrentHashMap", "option_d": "LinkedList", "correct_option": "C", "difficulty": "Medium"},
        {"question": "What does JVM stand for?", "option_a": "Java Virtual Machine", "option_b": "Java Variable Method", "option_c": "Just Virtual Memory", "option_d": "Java Vector Model", "correct_option": "A", "difficulty": "Easy"},
        {"question": "Which interface does HashMap implement?", "option_a": "List", "option_b": "Set", "option_c": "Map", "option_d": "Queue", "correct_option": "C", "difficulty": "Easy"},
        {"question": "What is the default value of a boolean in Java?", "option_a": "true", "option_b": "false", "option_c": "null", "option_d": "0", "correct_option": "B", "difficulty": "Easy"},
        {"question": "Which method must be implemented in a Runnable?", "option_a": "start()", "option_b": "execute()", "option_c": "run()", "option_d": "begin()", "correct_option": "C", "difficulty": "Easy"},
        {"question": "What is a lambda expression in Java?", "option_a": "A new type of loop", "option_b": "An anonymous function", "option_c": "A design pattern", "option_d": "A collection type", "correct_option": "B", "difficulty": "Medium"},
    ],
    "Python": [
        {"question": "What is the output of type([]) in Python?", "option_a": "<class 'tuple'>", "option_b": "<class 'list'>", "option_c": "<class 'array'>", "option_d": "<class 'set'>", "correct_option": "B", "difficulty": "Easy"},
        {"question": "Which is immutable in Python?", "option_a": "list", "option_b": "dict", "option_c": "tuple", "option_d": "set", "correct_option": "C", "difficulty": "Easy"},
        {"question": "What does *args do in Python?", "option_a": "Passes keyword arguments", "option_b": "Passes variable positional arguments", "option_c": "Declares a pointer", "option_d": "Multiplies arguments", "correct_option": "B", "difficulty": "Medium"},
        {"question": "What is a decorator in Python?", "option_a": "A design pattern", "option_b": "A function that wraps another function", "option_c": "A class method", "option_d": "A module", "correct_option": "B", "difficulty": "Medium"},
        {"question": "Which module is used for regular expressions in Python?", "option_a": "regex", "option_b": "re", "option_c": "regexp", "option_d": "pattern", "correct_option": "B", "difficulty": "Easy"},
        {"question": "What is GIL in Python?", "option_a": "Global Interface Layer", "option_b": "General Input Library", "option_c": "Global Interpreter Lock", "option_d": "Generalized Iteration Loop", "correct_option": "C", "difficulty": "Hard"},
        {"question": "What does list comprehension do?", "option_a": "Sorts a list", "option_b": "Creates a list using a compact expression", "option_c": "Compresses list data", "option_d": "Removes duplicates", "correct_option": "B", "difficulty": "Easy"},
        {"question": "What is __init__ in Python?", "option_a": "A destructor", "option_b": "A static method", "option_c": "A constructor", "option_d": "A module initializer", "correct_option": "C", "difficulty": "Easy"},
        {"question": "Which keyword creates a generator in Python?", "option_a": "return", "option_b": "yield", "option_c": "generate", "option_d": "async", "correct_option": "B", "difficulty": "Medium"},
        {"question": "What is the difference between == and is?", "option_a": "No difference", "option_b": "== checks value, is checks identity", "option_c": "is checks value, == checks identity", "option_d": "Both check identity", "correct_option": "B", "difficulty": "Medium"},
    ],
    "DSA": [
        {"question": "What is the time complexity of binary search?", "option_a": "O(n)", "option_b": "O(n²)", "option_c": "O(log n)", "option_d": "O(1)", "correct_option": "C", "difficulty": "Medium"},
        {"question": "Which data structure uses LIFO?", "option_a": "Queue", "option_b": "Stack", "option_c": "Tree", "option_d": "Heap", "correct_option": "B", "difficulty": "Easy"},
        {"question": "What is the space complexity of merge sort?", "option_a": "O(1)", "option_b": "O(log n)", "option_c": "O(n)", "option_d": "O(n²)", "correct_option": "C", "difficulty": "Hard"},
        {"question": "Which traversal visits root first?", "option_a": "Inorder", "option_b": "Postorder", "option_c": "Preorder", "option_d": "Level order", "correct_option": "C", "difficulty": "Easy"},
        {"question": "What is a hash collision?", "option_a": "When hash function fails", "option_b": "When two keys produce the same hash value", "option_c": "When memory overflows", "option_d": "When keys are deleted", "correct_option": "B", "difficulty": "Medium"},
        {"question": "What is a balanced BST?", "option_a": "A tree with equal nodes on both sides", "option_b": "A tree where height difference of subtrees is at most 1", "option_c": "A full binary tree", "option_d": "A complete binary tree", "correct_option": "B", "difficulty": "Medium"},
        {"question": "Dijkstra's algorithm finds?", "option_a": "Minimum spanning tree", "option_b": "Longest path", "option_c": "Shortest path", "option_d": "DFS traversal", "correct_option": "C", "difficulty": "Medium"},
        {"question": "What is dynamic programming?", "option_a": "Runtime code generation", "option_b": "Breaking problems into overlapping subproblems and storing results", "option_c": "A sorting algorithm", "option_d": "A data structure", "correct_option": "B", "difficulty": "Medium"},
        {"question": "Which sorting algorithm is best for nearly sorted data?", "option_a": "Bubble Sort", "option_b": "Insertion Sort", "option_c": "Quick Sort", "option_d": "Merge Sort", "correct_option": "B", "difficulty": "Hard"},
        {"question": "What is the time complexity of HashMap lookup?", "option_a": "O(n)", "option_b": "O(log n)", "option_c": "O(1) average", "option_d": "O(n²)", "correct_option": "C", "difficulty": "Easy"},
    ],
    "Web Dev": [
        {"question": "What does CSS stand for?", "option_a": "Computer Style Sheets", "option_b": "Cascading Style Sheets", "option_c": "Colorful Style Sheets", "option_d": "Creative Style Sheets", "correct_option": "B", "difficulty": "Easy"},
        {"question": "What is the DOM?", "option_a": "Data Object Model", "option_b": "Document Object Model", "option_c": "Dynamic Object Method", "option_d": "Document Order Map", "correct_option": "B", "difficulty": "Easy"},
        {"question": "What is React's virtual DOM?", "option_a": "A real browser DOM", "option_b": "A lightweight copy of the DOM in memory", "option_c": "A CSS framework", "option_d": "A server-side renderer", "correct_option": "B", "difficulty": "Medium"},
        {"question": "What is a RESTful API?", "option_a": "An API using SOAP", "option_b": "An API following REST architectural principles", "option_c": "A database API", "option_d": "A graphical API", "correct_option": "B", "difficulty": "Medium"},
        {"question": "What does async/await do in JavaScript?", "option_a": "Creates threads", "option_b": "Handles promises more readably", "option_c": "Runs code synchronously", "option_d": "Compiles JavaScript", "correct_option": "B", "difficulty": "Medium"},
        {"question": "What is CORS?", "option_a": "Cross-Origin Resource Sharing", "option_b": "Cross-Origin Request Security", "option_c": "Client-Origin Resource System", "option_d": "Cached Origin Response Standard", "correct_option": "A", "difficulty": "Medium"},
        {"question": "Which HTTP method is idempotent?", "option_a": "POST", "option_b": "PATCH", "option_c": "PUT", "option_d": "DELETE", "correct_option": "C", "difficulty": "Hard"},
        {"question": "What is the purpose of useEffect in React?", "option_a": "To manage state", "option_b": "To handle side effects", "option_c": "To render JSX", "option_d": "To style components", "correct_option": "B", "difficulty": "Medium"},
        {"question": "What is localStorage?", "option_a": "Server-side storage", "option_b": "Browser storage that persists after page close", "option_c": "Temporary session storage", "option_d": "Database storage", "correct_option": "B", "difficulty": "Easy"},
        {"question": "What is a Promise in JavaScript?", "option_a": "A synchronous function", "option_b": "An object representing a future async result", "option_c": "A loop construct", "option_d": "A module system", "correct_option": "B", "difficulty": "Medium"},
    ],
}

CODING_PROBLEMS = {
    "Java": [
        {"title": "Reverse a String", "difficulty": "Easy", "description": "Write a Java method that reverses a given string without using StringBuilder.reverse().", "template": "public static String reverse(String s) {\n    // Your code here\n}", "input_example": '"hello"', "output_example": '"olleh"'},
        {"title": "Find Duplicates", "difficulty": "Medium", "description": "Find all duplicate elements in an integer array.", "template": "public static List<Integer> findDuplicates(int[] nums) {\n    // Your code here\n}", "input_example": "[1,2,3,2,4,3]", "output_example": "[2,3]"},
        {"title": "Binary Search", "difficulty": "Easy", "description": "Implement binary search on a sorted array.", "template": "public static int binarySearch(int[] arr, int target) {\n    // Your code here\n}", "input_example": "arr=[1,3,5,7,9], target=5", "output_example": "2"},
    ],
    "Python": [
        {"title": "Two Sum", "difficulty": "Easy", "description": "Given an array of integers, return indices of two numbers that add up to target.", "template": "def two_sum(nums, target):\n    # Your code here\n    pass", "input_example": "nums=[2,7,11,15], target=9", "output_example": "[0,1]"},
        {"title": "Valid Parentheses", "difficulty": "Medium", "description": "Determine if the input string of brackets is valid.", "template": "def is_valid(s):\n    # Your code here\n    pass", "input_example": '"()[]{}"', "output_example": "True"},
        {"title": "Fibonacci", "difficulty": "Easy", "description": "Return the nth Fibonacci number.", "template": "def fibonacci(n):\n    # Your code here\n    pass", "input_example": "n=6", "output_example": "8"},
    ],
    "DSA": [
        {"title": "Merge Sorted Arrays", "difficulty": "Medium", "description": "Merge two sorted arrays into one sorted array.", "template": "def merge_sorted(arr1, arr2):\n    # Your code here\n    pass", "input_example": "[1,3,5], [2,4,6]", "output_example": "[1,2,3,4,5,6]"},
        {"title": "Max Subarray Sum", "difficulty": "Medium", "description": "Find the contiguous subarray with maximum sum (Kadane's Algorithm).", "template": "def max_subarray(nums):\n    # Your code here\n    pass", "input_example": "[-2,1,-3,4,-1,2,1,-5,4]", "output_example": "6"},
    ],
}

def get_mcq_for_subject(subject: str, count: int = 10) -> list:
    bank = MCQ_BANK.get(subject, MCQ_BANK.get("DSA", []))
    if len(bank) >= count:
        return random.sample(bank, count)
    return bank + random.choices(bank, k=max(0, count - len(bank)))

def get_coding_for_subject(subject: str) -> list:
    problems = CODING_PROBLEMS.get(subject, CODING_PROBLEMS.get("Python", []))
    if problems:
        return [random.choice(problems)]
    return []

def get_technical_interview_questions(subject: str, count: int = 5) -> list:
    """Get technical interview questions - first try DB, then fallback to hardcoded bank"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Try exact subject match
    rows = conn.execute(
        "SELECT * FROM questions WHERE category='Technical' AND subject=? AND is_active=1 ORDER BY RANDOM() LIMIT ?",
        (subject, count)
    ).fetchall()

    # Try partial match if not enough
    if len(rows) < count:
        rows2 = conn.execute(
            "SELECT * FROM questions WHERE category='Technical' AND subject LIKE ? AND is_active=1 ORDER BY RANDOM() LIMIT ?",
            (f"%{subject}%", count)
        ).fetchall()
        rows = list(rows) + [r for r in rows2 if r not in rows]

    conn.close()
    result = [dict(r) for r in rows[:count]]

    # Fallback to hardcoded bank if DB has no results
    if not result:
        bank = TECHNICAL_INTERVIEW_BANK.get(subject)
        if not bank:
            # Try to find closest match
            for key in TECHNICAL_INTERVIEW_BANK:
                if key.lower() in subject.lower() or subject.lower() in key.lower():
                    bank = TECHNICAL_INTERVIEW_BANK[key]
                    break
        if not bank:
            bank = TECHNICAL_INTERVIEW_BANK.get("General Programming", [])

        selected = random.sample(bank, min(count, len(bank)))
        result = [{"id": i+1, "question": q["question"], "answer": q["answer"],
                   "category": "Technical", "subject": subject,
                   "difficulty": q["difficulty"]} for i, q in enumerate(selected)]

    return result[:count]


@router.get("/mcq/{subject}")
def get_mcq_questions(subject: str, user=Depends(get_current_user)):
    questions = get_mcq_for_subject(subject, 10)
    result = []
    for i, q in enumerate(questions):
        result.append({
            "id": i + 1,
            "question": q["question"],
            "options": {"A": q["option_a"], "B": q["option_b"], "C": q["option_c"], "D": q["option_d"]},
            "correct_option": q["correct_option"],
            "difficulty": q.get("difficulty", "Medium")
        })
    return result

@router.get("/coding/{subject}")
def get_coding_questions(subject: str, user=Depends(get_current_user)):
    return get_coding_for_subject(subject)

@router.get("/interview/{category}")
def get_interview_questions(category: str, subject: str = None, count: int = 5, user=Depends(get_current_user)):
    if category == "Technical":
        return get_technical_interview_questions(subject or "General Programming", count)

    # HR and Communication - from DB
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT * FROM questions WHERE category=? AND is_active=1 ORDER BY RANDOM() LIMIT ?",
        (category, count)
    ).fetchall()
    conn.close()
    result = [dict(r) for r in rows]

    # Fallbacks for HR and Communication
    if not result:
        fallbacks = {
            "HR": [
                {"id": 1, "question": "Tell me about yourself.", "answer": "I am a motivated individual with strong interest in learning and contributing to the organization.", "category": "HR", "difficulty": "Easy"},
                {"id": 2, "question": "What are your greatest strengths?", "answer": "My greatest strengths include problem-solving, communication, and ability to work in a team.", "category": "HR", "difficulty": "Easy"},
                {"id": 3, "question": "Where do you see yourself in 5 years?", "answer": "In 5 years, I see myself as a skilled professional contributing to meaningful projects and growing in my career.", "category": "HR", "difficulty": "Medium"},
                {"id": 4, "question": "Why should we hire you?", "answer": "I bring strong technical skills, quick learning ability, and genuine passion for this field.", "category": "HR", "difficulty": "Medium"},
                {"id": 5, "question": "Describe a challenge you overcame.", "answer": "I faced a tight deadline on a project and overcame it by prioritizing tasks and collaborating with teammates.", "category": "HR", "difficulty": "Hard"},
            ],
            "Communication": [
                {"id": 1, "question": "How do you explain complex ideas clearly?", "answer": "I break them into simple steps, use analogies, and confirm understanding by asking questions.", "category": "Communication", "difficulty": "Easy"},
                {"id": 2, "question": "Describe your communication style.", "answer": "I adapt my style based on the audience - formal for professional settings, casual for team discussions.", "category": "Communication", "difficulty": "Easy"},
                {"id": 3, "question": "How do you handle miscommunication in a team?", "answer": "I address it immediately by clarifying the misunderstanding calmly and ensuring everyone is aligned.", "category": "Communication", "difficulty": "Medium"},
                {"id": 4, "question": "How do you give constructive feedback?", "answer": "I use the sandwich method - positive, improvement area, positive. I focus on behavior not person.", "category": "Communication", "difficulty": "Medium"},
                {"id": 5, "question": "Describe a time when you had to present to a large group.", "answer": "I prepared thoroughly, practiced multiple times, used clear visuals, and engaged the audience with questions.", "category": "Communication", "difficulty": "Hard"},
            ],
        }
        result = fallbacks.get(category, [])

    return result[:count]

@router.get("/subjects")
def get_subjects(user=Depends(get_current_user)):
    return SUBJECTS

# Admin CRUD
class QuestionCreate(BaseModel):
    question: str
    answer: str = ""
    category: str
    subject: str = ""
    difficulty: str = "Medium"
    question_type: str = "interview"

@router.get("/all")
def get_all_questions(category: str = None, user=Depends(require_admin)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    if category:
        rows = conn.execute("SELECT * FROM questions WHERE category=? ORDER BY id", (category,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM questions ORDER BY id").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/")
def create_question(q: QuestionCreate, user=Depends(require_admin)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO questions (question, answer, category, subject, difficulty, question_type, created_by)
                 VALUES (?,?,?,?,?,?,?)''',
              (q.question, q.answer, q.category, q.subject, q.difficulty, q.question_type, user["id"]))
    conn.commit()
    qid = c.lastrowid
    conn.close()
    return {"id": qid, "message": "Question created"}

@router.delete("/{question_id}")
def delete_question(question_id: int, user=Depends(require_admin)):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE questions SET is_active=0 WHERE id=?", (question_id,))
    conn.commit()
    conn.close()
    return {"message": "Question deactivated"}