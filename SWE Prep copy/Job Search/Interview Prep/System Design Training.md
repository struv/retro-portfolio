# System Design Interview Training

Created October 13, 2026.

Build the ability to explain a working system, choose components for a specific requirement, and reason through failures. Start with a small form service related to your existing web application experience, then add concurrency, load, and failure scenarios. Keep independent Python practice alongside this track.

System design knowledge has not been assessed. Shipping applications with agents gives us useful examples to discuss; the first attempt will show which decisions you can explain independently. Use fictional teams and synthetic submissions for practice. Confirm the actual architecture before turning a practice explanation into a claim about Modulo or vaccine inventory.

## Ideas from the Reddit discussion

In [Happy_Invite_8842's comment branch](https://www.reddit.com/r/leetcode/comments/1wck65h/comment/p8yeshx/), the useful advice is to understand APIs, databases, SQL versus NoSQL, and load balancers through building and explaining systems. Replies add caching, race conditions, replication, and CAP. The emphasis is understanding why a component is needed and what it costs, rather than memorizing a finished architecture.

The accessible comments inform this topic list; expanded replies were blocked by Reddit's bot check. The post's Google interview claims remain unverified, as the moderators note in the [original discussion](https://www.reddit.com/r/leetcode/comments/1wck65h/leetcode_grind_is_dead_google_is_changing_swe/). Confirm the format and allowed tools for each actual interview.

## How sessions work

As a starting rhythm, use two Python sessions for each system design session. Choose the weekly pace when sustainable preparation time is known. A design session can take roughly 30–45 minutes; this is a practice target, not recorded time or a deadline. Each stage below can take several sessions.

1. Start with brief recall of one previous decision using a changed example. For the first session, start with the request trace in [exercise 1](System%20Design/01_form_submission.md).
2. Attempt one question before opening references or asking AI for a design. Plain language and rough arrows are enough. Record uncertainty.
3. Explain the smallest design that satisfies the requirements. Connect each component to a job it performs.
4. Introduce one failure or changed requirement. Predict what happens, then use a small local experiment when it will make the behavior clearer.
5. Explain what changed, its benefit, and its cost. Save the attempt and record assistance in [system design progress](System%20Design/PROGRESS.md).

The coach gives one focused hint at a time and explains unfamiliar terms with small examples. Present one exercise at a time. Prepare later labs only when the learner reaches them: standard-library Python, clear examples, unfinished learner functions, and checkers below those functions. Identify any coach-provided infrastructure separately. Preserve attempts and provide complete solutions when explicitly requested.

## Learning sequence

| Stage | Concepts to learn | Practice and evidence to produce |
|---|---|---|
| 1. Trace a request | Browser, HTTP request and response, API, validation, durable storage, authentication and authorization | Trace one fictional form submission. Explain what the server must do before reporting success, how another team is excluded, and what a timeout tells the client. Start with the trace alone. |
| 2. Model the data | Tables and keys, relationships, constraints, indexes, SQL queries, relational versus document or key-value storage | Model teams, forms, and submissions. Write a query for one team's submissions and identify the likely index. Compare a relational model with one specific NoSQL model using required reads, writes, and integrity rules. |
| 3. Handle competing writes | Race conditions, atomic operations, transactions, isolation, uniqueness | Trace two staff members reserving the last fictional inventory item. Reproduce a broken read-then-write sequence, then explain and check a fix. Reuse the idea for duplicate form submissions. |
| 4. Handle more traffic | Requests per second, peak versus average load, latency, bottlenecks, vertical and horizontal scaling, load balancing, health checks, shared state | Estimate load from explicit hypothetical inputs. Trace requests through two application instances and predict what breaks if saved submissions or sessions exist only in one instance. Choose a scaling step based on the bottleneck. |
| 5. Cache repeated reads | Browser and CDN caches, application caches, cache hits and misses, expiration, invalidation, stale data | Use an editable form definition as the example. Simulate a cache hit, an update, and a stale read. Explain which layer you would cache, acceptable staleness, and what happens when the cache fails. Introduce cache stampedes after the basic flow is understood. |
| 6. Move slow work into jobs | Queue and worker, retries, backoff, duplicate delivery, idempotency, failed-job handling | Add a fictional notification after a submission. Trace a worker crash before and after the external send. Explain what can be retried safely, what must be stored durably, and what requires cooperation from the external provider. |
| 7. Reason about copies and failure | Primary and replica, synchronous and asynchronous replication, stale reads, failover, backups, replication versus sharding, CAP | Simulate a delayed replica and a network break between copies. Decide whether a submission receipt and a statistics page can tolerate the same freshness. Explain the tradeoff for each operation and distinguish a replica from a recoverable backup. |
| 8. Defend a complete design | Requirements, API and data model, capacity assumptions, failure handling, logs and metrics, alternatives, operational cost | Give a 30–40 minute mock for a form service, inventory reservation service, or notification service. Add one surprise requirement. Then critique an AI-proposed change and verify an important claim with a local experiment or documentation. |

Start with stages 1–3. Add later components when the scenario creates a reason to use them. Deep distributed algorithms and global architectures can follow when assessed gaps or target roles justify them.

## Technical points to retain

An HTTP interaction consists of a client request and a server response. Distinguish the interface the client calls from the code that handles the request and the storage that retains the result. See [MDN's HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview).

Choose a database using the data model, required queries, latency, integrity, and recovery needs. Compare specific products and configurations; SQL and NoSQL are broad categories. See [AWS's database selection factors](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-managed-postgresql/db-selection.html).

A transaction groups changes into an all-or-nothing operation. Correct behavior under competing requests also depends on the statements, constraints, and isolation level. Learn the difference through the inventory experiment. See [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html) and [transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).

In cache-aside, the application checks a cache, loads from the database on a miss, and stores the result for later reads. Expiration and invalidation affect how long old values can be served; examine concurrent reads and writes before promising freshness. See [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/).

An at-least-once queue can deliver the same message again. Idempotency means repeated processing avoids an additional unintended effect. In notification practice, distinguish recording a job once from making an external send happen once. See [Amazon SQS delivery behavior](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html).

Asynchronous replication can leave a readable copy behind the primary. Synchronous replication adds waiting for another copy according to the configured guarantee. Explore the user-visible consequences before naming a preference. See [PostgreSQL replication](https://www.postgresql.org/docs/current/warm-standby.html).

CAP concerns a replicated system when communication between parts fails: it cannot guarantee both linearizable consistency, meaning operations behave as if performed on one copy in real-time order, and successful completion of every request to nonfailed nodes. Explain an actual read or write during the failure. See Gilbert and Lynch's [Perspectives on the CAP Theorem](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), section 2.

Read the relevant passage after an attempt. These references support the exercises; there is no requirement to finish them all before starting.

## Evidence of understanding

Advance when the learner can explain the normal path, predict a relevant failure, justify a choice against an alternative, and describe a check that would expose a wrong assumption. For a lab, review the saved code and run its checks. Ask for a learner-added case and an explanation of its significance. Ask for time and space costs for implemented algorithms; discuss latency, throughput, storage, and operational costs for the system.

Record hints, reference consultation, AI assistance, supplied checks, learner-added checks, solution exposure, and explanations separately. A coached explanation or a passing supplied lab is guided completion. Record independent understanding only after a new unaided variant has been reviewed. Leave future retrieval and mock results pending until they happen.

## Connect to real project interviews

After the first few stages, choose one actual project and explain its problem, one request path, storage, a failure, a design decision, and verification. Distinguish your decisions and review from agent-written implementation. Use confirmed architecture and dated results from [Resume Evidence](../Resume/Resume%20Evidence.md).

During AI-assisted practice, first state your own design or debugging hypothesis. Then ask AI to challenge a specific assumption or offer an alternative. Explain which suggestion you accepted or rejected and verify the critical behavior. Keep separate unaided variants to assess your own reasoning. Use AI in interviews only when that round explicitly permits it.

## Next action

Open [exercise 1](System%20Design/01_form_submission.md) and answer its opening request-trace question without a reference architecture. System design progress starts unattempted. The Python next action remains Series 3 exercise 1; the independent Python baseline remains unattempted.
