"""Python Series 3: frequency maps and positions.

Start at exercise 1 in your next session. Work on one function at a time.
Suggested practice targets: 10 minutes for 1, 15 for 2, and 15 for 3.
These are guides; record actual time and any hints instead of rushing.

From a terminal in Job Search, run:
    python3 "Interview Prep/03_frequency_map_practice.py" 1
Use 2 or 3 for the next exercise, or all to check all three.

First, try recalling the counting pattern from memory. You may define a helper
in the helper area below. If needed, reuse your own character_counts function
from 02_character_counts.py and record that you consulted earlier code.

Use dictionaries and loops. For this series, avoid Counter, sorting, and
repeated calls to str.count(). Aim for average linear time in the input length.
Strings are case-sensitive; spaces, punctuation, and Unicode count as written.

Before coding, trace one example by hand. After your checks pass, add one case
of your own and explain the time and extra-space costs. Send your attempt for
review. Ask for one hint if stuck; complete reference solutions are not here.

Syntax reference for exercise 2: enumerate(text) gives an index and character
together. For "cat", those pairs are (0, "c"), (1, "a"), and (2, "t").
The index starts at 0, and an ordinary for loop can unpack the two values.
"""


# OPTIONAL HELPER AREA — Write or paste your own character_counts here.
def character_counts(s:str) -> dict[str,int]:
    counts = {}
    for i in s:
        if i in counts:
            counts[i] += 1
        else:
            counts[i] = 1
    return counts

# EXERCISE 1 — Retrieval: compare character counts
def valid_anagram(s: str, t: str) -> bool:
    """Return whether s and t have exactly the same characters and counts.

    Character order does not matter. Both empty strings are anagrams.
    Examples:
        valid_anagram("aab", "aba") == True
        valid_anagram("aab", "abb") == False
        valid_anagram("", "") == True

    Try rebuilding the counting approach before looking at earlier code.
    """
    return character_counts(s) == character_counts(t)


# EXERCISE 2 — Find a position using character counts
def first_unique_index(text: str) -> int:
    """Return the index of the first character that appears exactly once.

    Return -1 if there is no such character, including for empty input.
    Examples:
        first_unique_index("leetcode") == 0
        first_unique_index("loveleetcode") == 2
        first_unique_index("aabb") == -1

    In "loveleetcode", l and o repeat, while v appears once at index 2.
    """
    d = {}
    for i in text:
        if i in d:
            d[i] += 1
        else:
            d[i] = 1
    for index, char in enumerate(text):
        if d[char] == 1:
            return index
    return -1


# EXERCISE 3 — Compare required counts with available counts
def can_build_note(note: str, available: str) -> bool:
    """Return whether the available characters can build the entire note.

    Each occurrence in available can be used at most once. Extra available
    characters are allowed, and order does not matter. An empty note is valid.
    Examples:
        can_build_note("aab", "baa") == True
        can_build_note("aab", "ab") == False
        can_build_note("ab", "abxyz") == True

    Explain how this requirement differs from exact anagram equality.
    """
    raise NotImplementedError("Write exercise 3 here.")


# CHECKER — Edit the functions above; add your own cases here.
CASES = {
    1: [
        (("aab", "aba"), True),
        (("aab", "abb"), False),
        (("", ""), True),
        (("aab", "ab"), False),
        (("ab", "abxyz"), False),
        (("A", "a"), False),
        (("a !", "! a"), True),
        (("åßå", "ßåå"), True),
        (("", "x"), False),
        (("hello", "hi"), False),
    ],
    2: [
        (("leetcode",), 0),
        (("loveleetcode",), 2),
        (("aabb",), -1),
        (("",), -1),
        (("x",), 0),
        (("aabbcdd",), 4),
        (("AaA",), 1),
        (("åßå",), 1),
        (("a a!",), 1),
    ],
    3: [
        (("aab", "baa"), True),
        (("aab", "ab"), False),
        (("ab", "abxyz"), True),
        (("", ""), True),
        (("", "anything"), True),
        (("a", ""), False),
        (("aa", "a"), False),
        (("A", "a"), False),
        (("a a", "aa"), False),
        (("åßå", "ßåå!"), True),
    ],
}


def run_checks(exercise: int) -> int:
    functions = {1: valid_anagram, 2: first_unique_index, 3: can_build_note}
    function = functions[exercise]
    failures = 0
    print(f"\nExercise {exercise}: {function.__name__}")
    for arguments, expected in CASES[exercise]:
        try:
            actual = function(*arguments)
        except NotImplementedError:
            print("TODO: this is a starter. Implement the function, then rerun.")
            return 1
        except Exception as error:
            failures += 1
            print(f"FAIL {arguments!r}: {type(error).__name__}: {error}")
            continue
        if type(actual) is type(expected) and actual == expected:
            print(f"PASS {arguments!r} -> {actual!r}")
        else:
            failures += 1
            print(f"FAIL {arguments!r}: expected {expected!r}, got {actual!r}")
    if failures:
        print(f"{failures} check(s) need attention.")
        return 1
    print("All provided checks passed. Add a case and explain your approach.")
    return 0


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2 or sys.argv[1] not in {"1", "2", "3", "all"}:
        print('Run: python3 "Interview Prep/03_frequency_map_practice.py" 1 (or 2, 3, all)')
        raise SystemExit(2)
    exercises = (1, 2, 3) if sys.argv[1] == "all" else (int(sys.argv[1]),)
    results = [run_checks(exercise) for exercise in exercises]
    raise SystemExit(0 if all(result == 0 for result in results) else 1)
