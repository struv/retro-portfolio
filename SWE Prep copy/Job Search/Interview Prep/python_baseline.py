"""Independent Python baseline — try when ready for an unaided assessment.

Full instructions and the attempt record are in Python Baseline.md.
No attempt has been recorded. This file is an unimplemented starter.

Allow 20 minutes when ready. For the independent attempt, use no hints,
solution lookup, or AI completion. Running Python and writing tests is allowed.
Explain your approach aloud before coding. If stuck, record where you stopped;
we can work through it together afterward.

Implement repeated_device_ids(device_ids).
Return each ID appearing at least twice, exactly once, in the order of its
FIRST appearance. IDs are case-sensitive. Do not modify the input.

Example: ["A", "B", "B", "A"] must return ["A", "B"].

From a terminal in the Job Search folder, run:
    python3 "Interview Prep/python_baseline.py"

Afterward, record time, assistance, results, edge cases, and time/space
complexity in Python Baseline.md. Explain how you preserve the required order.
"""


def repeated_device_ids(device_ids: list[str]) -> list[str]:
    raise NotImplementedError("Write your baseline attempt here.")


# CHECKER — Implement the function above; add your own cases below.
CASES = [
    ([], []),
    (["A", "B", "C"], []),
    (["A", "B", "B", "A"], ["A", "B"]),
    (["X", "X", "X", "Y", "Y"], ["X", "Y"]),
    (["a", "A", "a"], ["a"]),
    (["A", "B", "C", "C", "B", "A"], ["A", "B", "C"]),
    (["once", "repeat", "repeat", "last"], ["repeat"]),
]


def run_checks() -> int:
    failures = 0
    for device_ids, expected in CASES:
        before = device_ids.copy()
        try:
            actual = repeated_device_ids(device_ids)
        except NotImplementedError:
            print("This is a starter: implement repeated_device_ids first, then rerun.")
            return 1
        except Exception as error:
            failures += 1
            print(f"FAIL {before!r}: {type(error).__name__}: {error}")
            continue
        passed = type(actual) is list and actual == expected and device_ids == before
        if passed:
            print(f"PASS {before!r} -> {actual!r}")
        else:
            failures += 1
            print(f"FAIL {before!r}: expected {expected!r}, got {actual!r}")
            if device_ids != before:
                print("  The input list was changed. Keep it unchanged.")
    if failures:
        print(f"\n{failures} check(s) need attention.")
        return 1
    print("\nAll provided checks passed. Add two edge cases and explain your approach.")
    return 0


if __name__ == "__main__":
    raise SystemExit(run_checks())
