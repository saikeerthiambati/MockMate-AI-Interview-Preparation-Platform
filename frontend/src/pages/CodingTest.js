import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ToggleLeft, ToggleRight, BookOpen, Zap, Clock, Database } from 'lucide-react';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import API from '../utils/api';

// ── OPTIMAL SOLUTIONS with complexity explanation ──
const OPTIMAL_SOLUTIONS = {
  "Reverse a String": {
    code: `public static String reverse(String s) {
    char[] chars = s.toCharArray();
    int left = 0, right = chars.length - 1;
    while (left < right) {
        char temp = chars[left];
        chars[left] = chars[right];
        chars[right] = temp;
        left++;
        right--;
    }
    return new String(chars);
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    explanation: "Two-pointer approach: one pointer starts from left, another from right. They swap characters and move toward the center. This is optimal because:\n• We visit each character exactly once → O(n) time\n• We use a char array of same size as input → O(n) space\n• No nested loops, no extra data structures needed\n• Using StringBuilder.reverse() internally does the same thing but this shows the logic clearly."
  },
  "Find Duplicates": {
    code: `public static List<Integer> findDuplicates(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    List<Integer> duplicates = new ArrayList<>();
    for (int num : nums) {
        if (!seen.add(num)) {
            duplicates.add(num);
        }
    }
    return duplicates;
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    explanation: "HashSet approach is optimal here:\n• HashSet.add() returns false if element already exists → O(1) per operation\n• Single pass through array → O(n) time total\n• Worse approach: nested loops would be O(n²)\n• Sorting + scanning would be O(n log n)\n• HashSet gives us O(n) at the cost of O(n) space — best time-space tradeoff."
  },
  "Binary Search": {
    code: `public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2; // avoids overflow
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    explanation: "Binary search is the most efficient search on sorted arrays:\n• Each iteration eliminates HALF the remaining elements\n• After k iterations, only n/2^k elements remain → log₂(n) iterations max\n• O(1) space because we only use 3 integer variables (left, right, mid)\n• Linear search would be O(n) — binary search is exponentially faster\n• Note: mid = left + (right-left)/2 prevents integer overflow vs (left+right)/2"
  },
  "Two Sum": {
    code: `def two_sum(nums, target):
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    explanation: "HashMap (dictionary) approach is optimal:\n• Brute force: check every pair → O(n²) time\n• Sorting: sort then two pointers → O(n log n) time\n• HashMap: single pass, O(1) lookup per element → O(n) time ✓\n• For each number, we check if its complement (target - num) was seen before\n• We store each number's index in the dict for O(1) lookup\n• Trade-off: O(n) extra space for the dict, but we get O(n) time"
  },
  "Valid Parentheses": {
    code: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    explanation: "Stack is the perfect data structure for bracket matching:\n• Opening brackets get pushed onto stack\n• Closing brackets must match the top of stack (LIFO order)\n• Dictionary maps each closing bracket to its matching opener\n• Single pass through string → O(n) time\n• Stack can hold at most n/2 elements → O(n) space\n• Why stack? Because the most recently opened bracket must close first — that's exactly what LIFO gives us"
  },
  "Fibonacci": {
    code: `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    explanation: "Iterative approach is most optimal:\n• Naive recursion: O(2^n) time — recalculates same values repeatedly\n• Memoized recursion: O(n) time, O(n) space for memo dict\n• Iterative (this solution): O(n) time, O(1) space ✓\n• We only need the previous two values at any point, so we use two variables a, b instead of storing all values\n• This is called 'space-optimized dynamic programming'\n• For very large n, matrix exponentiation gives O(log n) but much more complex"
  },
  "Merge Sorted Arrays": {
    code: `def merge_sorted(arr1, arr2):
    result = []
    i = j = 0
    while i < len(arr1) and j < len(arr2):
        if arr1[i] <= arr2[j]:
            result.append(arr1[i])
            i += 1
        else:
            result.append(arr2[j])
            j += 1
    result.extend(arr1[i:])
    result.extend(arr2[j:])
    return result`,
    timeComplexity: "O(m + n)",
    spaceComplexity: "O(m + n)",
    explanation: "Two-pointer merge technique (same as Merge Sort's merge step):\n• Two pointers, one for each array, start at index 0\n• Always pick the smaller element and advance that pointer\n• When one array is exhausted, append remaining elements of other\n• Each element is visited exactly once → O(m+n) time\n• We need a new array for result → O(m+n) space\n• This is optimal because we must read all m+n elements at least once\n• Naive approach: concatenate and sort → O((m+n) log(m+n)) — much worse!"
  },
  "Max Subarray Sum": {
    code: `def max_subarray(nums):
    max_sum = current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    explanation: "Kadane's Algorithm — classic dynamic programming:\n• Key insight: at each position, the max subarray ending here is either:\n  1. Just the current element (start fresh)\n  2. Current element + best subarray ending at previous position\n• current_sum = max(num, current_sum + num) captures this logic\n• Brute force: check all O(n²) subarrays → O(n²) time\n• Kadane's: single pass → O(n) time, O(1) space ✓\n• We don't need to store anything — just track current and global max\n• This is a perfect example of 'optimal substructure' in DP"
  },
}

export default function CodingTest() {
  const { subject } = useParams();
  const nav = useNavigate();
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerReset, setTimerReset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [activeTab, setActiveTab] = useState('problem'); // problem | solution

  useEffect(() => {
    async function load() {
      try {
        const { data } = await API.get(`/questions/coding/${encodeURIComponent(subject)}`);
        const arr = Array.isArray(data) ? data : [data];
        setProblems(arr);
        setUserCode(arr[0]?.template || '// Your code here');
        const { data: s } = await API.post('/interviews/start', {
          category: 'Technical', subject, session_type: 'coding'
        });
        setSessionId(s.session_id);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [subject]);

  useEffect(() => {
    const p = problems[current];
    if (p) {
      setUserCode(p.template || '// Your code here');
      setSubmitted(false);
      setActiveTab('problem');
    }
  }, [current, problems]);

  const handleSubmit = () => {
    setSubmitted(true);
    setActiveTab('solution');
  };

  const handleNext = async () => {
    if (current + 1 >= problems.length) {
      await API.post('/interviews/finish', { session_id: sessionId });
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setTimerReset(r => r + 1);
    }
  };

  if (loading) return (
    <div className="page"><Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (finished) return (
    <div className="page">
      <Navbar backTo={`/technical/${encodeURIComponent(subject)}/mode`} backLabel={subject} />
      <div className="page-narrow" style={{ maxWidth: 500, textAlign: 'center', paddingTop: 60 }}>
        <div className="card fade-in" style={{ padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Coding Test Complete!</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 32 }}>All problems submitted successfully.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => nav('/dashboard')}>Dashboard</button>
            <button className="btn btn-primary" onClick={() => nav('/analysis')}>View Analytics</button>
          </div>
        </div>
      </div>
    </div>
  );

  const prob = problems[current];
  if (!prob) return (
    <div className="page"><Navbar />
      <div style={{ textAlign: 'center', marginTop: 80, color: 'var(--text2)' }}>
        No coding problems for {subject} yet.
      </div>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="btn btn-secondary" onClick={() => nav(`/technical/${encodeURIComponent(subject)}/mode`)}>← Back</button>
      </div>
    </div>
  );

  const optimal = OPTIMAL_SOLUTIONS[prob.title] || null;
  const fileExt = subject === 'Python' ? 'py' : subject === 'Java' ? 'java' : 'cpp';

  return (
    <div className="page">
      {/* Top bar */}
      <div className="test-topbar">
        <div className="test-topbar-left">
          <button className="btn btn-secondary btn-sm"
            onClick={() => nav(`/technical/${encodeURIComponent(subject)}/mode`)}>
            ← Exit
          </button>
        </div>
        <span className="test-title">{subject} — Coding</span>
        <div className="test-topbar-right">
          <button className="nav-icon-btn" onClick={() => setTimerEnabled(!timerEnabled)}>
            {timerEnabled
              ? <ToggleRight size={22} style={{ color: 'var(--cyan)' }} />
              : <ToggleLeft size={22} />}
          </button>
          {timerEnabled && !submitted && (
            <Timer
              seconds={300}
              onExpire={handleSubmit}
              enabled={timerEnabled && !submitted}
              reset={timerReset}
            />
          )}
          <span style={{ color: 'var(--text2)', fontSize: 14 }}>{current + 1}/{problems.length}</span>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 60px)' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          {/* Tabs - Problem / Optimal Solution */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
            {['problem', 'solution'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={tab === 'solution' && !submitted}
                style={{
                  flex: 1, padding: '12px 0', border: 'none', cursor: submitted || tab === 'problem' ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  background: activeTab === tab ? 'var(--card)' : 'transparent',
                  color: activeTab === tab ? 'var(--cyan)' : tab === 'solution' && !submitted ? 'var(--text3)' : 'var(--text2)',
                  borderBottom: activeTab === tab ? '2px solid var(--cyan)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}>
                {tab === 'problem' ? '📝 Problem' : `⚡ Optimal Solution ${!submitted ? '(submit first)' : ''}`}
              </button>
            ))}
          </div>

          {/* Problem tab */}
          {activeTab === 'problem' && (
            <div style={{ padding: 24, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: 20 }}>{prob.title}</h3>
                <span className={`badge badge-${(prob.difficulty || 'easy').toLowerCase()}`}>
                  {prob.difficulty || 'Easy'}
                </span>
              </div>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>{prob.description}</p>
              {prob.input_example && (
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600, marginBottom: 6 }}>Example</div>
                  <div className="mono" style={{ fontSize: 13 }}>
                    <div><span style={{ color: 'var(--green)' }}>Input:</span> {prob.input_example}</div>
                    <div><span style={{ color: 'var(--purple2)' }}>Output:</span> {prob.output_example}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optimal Solution tab — shown after submit */}
          {activeTab === 'solution' && submitted && optimal && (
            <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 4, color: 'var(--cyan)' }}>⚡ Optimal Solution</h3>
              <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>
                Here's the most efficient solution with complexity analysis
              </p>

              {/* Complexity badges */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 8 }}>
                  <Clock size={14} style={{ color: 'var(--cyan)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>Time: {optimal.timeComplexity}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(124,92,191,0.1)', border: '1px solid rgba(124,92,191,0.3)', borderRadius: 8 }}>
                  <Database size={14} style={{ color: 'var(--purple2)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)' }}>Space: {optimal.spaceComplexity}</span>
                </div>
              </div>

              {/* Optimal code */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>
                    optimal.{fileExt}
                  </span>
                </div>
                <pre className="mono" style={{
                  padding: 16, margin: 0, fontSize: 13,
                  color: 'var(--text)', lineHeight: 1.7,
                  overflowX: 'auto', whiteSpace: 'pre-wrap'
                }}>
                  {optimal.code}
                </pre>
              </div>

              {/* Why this is optimal — explanation */}
              <div style={{
                background: 'rgba(0,212,170,0.06)',
                border: '1px solid rgba(0,212,170,0.25)',
                borderRadius: 10, padding: 16
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={14} /> WHY THIS IS OPTIMAL
                </div>
                <pre style={{
                  fontFamily: 'inherit', fontSize: 13,
                  color: 'var(--text2)', lineHeight: 1.8,
                  whiteSpace: 'pre-wrap', margin: 0
                }}>
                  {optimal.explanation}
                </pre>
              </div>
            </div>
          )}

          {/* No optimal solution available */}
          {activeTab === 'solution' && submitted && !optimal && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
              <Zap size={32} style={{ marginBottom: 12, color: 'var(--text3)' }} />
              <p>Optimal solution not available for this problem yet.</p>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL — Code Editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg2)' }}>
          {/* Editor header */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
            <span className="mono" style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>
              solution.{fileExt}
            </span>
            {submitted && (
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                ✓ Submitted
              </span>
            )}
          </div>

          {/* Code editor */}
          <textarea
            value={userCode}
            onChange={e => setUserCode(e.target.value)}
            disabled={submitted}
            className="mono"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 14, lineHeight: 1.7,
              padding: 20, resize: 'none', tabSize: 2,
              opacity: submitted ? 0.7 : 1
            }}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const s = e.target.selectionStart;
                setUserCode(v => v.substring(0, s) + '  ' + v.substring(e.target.selectionEnd));
                setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
              }
            }}
            placeholder="Write your solution here..."
          />

          {/* Bottom action bar */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
            {submitted ? (
              <>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                  👆 Check the <strong style={{ color: 'var(--cyan)' }}>Optimal Solution</strong> tab
                </span>
                <button className="btn btn-primary" onClick={handleNext}>
                  {current + 1 >= problems.length ? 'Finish 🎉' : 'Next Problem →'}
                </button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                  Tab = 2 spaces indent
                </span>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <Play size={16} /> Run & Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}