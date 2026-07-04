# Firestore Security Specification - Aqua-Synth

## 1. Data Invariants

1. **Technology Records**:
   - Must have a clean alphanumeric ID `techId` conforming to `^[a-zA-Z0-9_\-]+$`.
   - Must contain a physical name, category, and a description of appropriate size.
   - Numerical ratings must fall within predefined scales (e.g., Sustainability Score and Cost Rating `0-100`, Brine Impact `1-10`).
   - Re-evaluation / updates of technology node properties must strictly define allowable affected keys to prevent side-loading.

2. **Community & Agent Comments**:
   - Must reference a valid `techId`.
   - Must include a designated author name and comment text under reasonable string sizes (no unconstrained payloads to exhaust storage).
   - Once published, comments are immutable and cannot be updated or deleted by clients.

---

## 2. The "Dirty Dozen" Rogue Payloads

The following rogue payloads represent 12 distinct attempts to compromise system safety:

### Payload 1: ID Poisoning (Resource Exhaustion)
- **Target**: `technologies/{techId}`
- **Attempt**: Try to inject a massive string (1.5KB of garbage characters) as the Document ID.
- **Payload**:
  ```json
  {
    "id": "a".repeat(1500),
    "name": "Poison ID Method",
    "category": "Solar",
    "description": "Exploit search indexes"
  }
  ```

### Payload 2: Ghost Field Side-Loading
- **Target**: `technologies/reverse-osmosis`
- **Attempt**: Update an existing technology and inject a non-whitelisted attribute (`isVerifiedAdminApproved: true`).
- **Payload**:
  ```json
  {
    "name": "Modern Reverse Osmosis (RO)",
    "category": "Membrane",
    "description": "Standard description limit...",
    "isVerifiedAdminApproved": true
  }
  ```

### Payload 3: Invalid Type Escalation
- **Target**: `technologies/reverse-osmosis`
- **Attempt**: Send a boolean or string instead of a valid numeric value for `costRating`.
- **Payload**:
  ```json
  {
    "name": "Modern Reverse Osmosis (RO)",
    "category": "Membrane",
    "description": "Standard description...",
    "costRating": "SUPER HIGH EXPLOIT"
  }
  ```

### Payload 4: Array Size Attack (Denial of Wallet)
- **Target**: `technologies/new-solar-tech`
- **Attempt**: Side-load a pros list containing over 1,000 blank entries.
- **Payload**:
  ```json
  {
    "name": "Aggressive List Solar",
    "category": "Solar",
    "description": "Test limits",
    "pros": ["x" for i in range(1000)]
  }
  ```

### Payload 5: Anonymous Spoof write
- **Target**: `comments/c-exploit`
- **Attempt**: Submit a comment as an unauthenticated or anonymous visitor when verified email auth has been strictly mandated.
- **Payload**:
  ```json
  {
    "techId": "reverse-osmosis",
    "author": "Anonymous Guy",
    "content": "Malicious payload injection"
  }
  ```

### Payload 6: Unverified Email Hijack
- **Target**: `comments/c-exploit`
- **Attempt**: Authenticate with email verification set to `false`, attempting to bypass verified registration.
- **Payload**:
  ```json
  {
    "techId": "graphene-filter-futuristic",
    "author": "Spammer",
    "content": "Advertise random links"
  }
  ```

### Payload 7: Commentary Content Flooding
- **Target**: `comments/c-exploit`
- **Attempt**: Inject 5MB of comment text to trigger database storage exhaustion.
- **Payload**:
  ```json
  {
    "techId": "reverse-osmosis",
    "author": "Tester",
    "content": "x".repeat(50000)
  }
  ```

### Payload 8: Immutable Comment Alteration
- **Target**: `comments/c1`
- **Attempt**: Overwrite an existing community thread to change its original author or body.
- **Payload**:
  ```json
  {
    "techId": "reverse-osmosis",
    "author": "Eng. Clara Vance",
    "content": "Manipulated text by a third party"
  }
  ```

### Payload 9: Rogue Category Side-Step
- **Target**: `technologies/exploit-tech`
- **Attempt**: Submit a technology with a disallowed category type, bypassing enum validation list.
- **Payload**:
  ```json
  {
    "name": "Infinite Energy Distiller",
    "category": "Alien-Physics-Quantum",
    "description": "A fake category"
  }
  ```

### Payload 10: Score Boundary Overrun (Negative Value)
- **Target**: `technologies/solar-stills`
- **Attempt**: Set the sustainability score to negative `-500` or overflow `250` to break UI layouts.
- **Payload**:
  ```json
  {
    "name": "Solar distillation",
    "category": "Solar",
    "description": "Description...",
    "sustainabilityScore": -500
  }
  ```

### Payload 11: Brine Impact Overflow
- **Target**: `technologies/reverse-osmosis`
- **Attempt**: Set the brine impact rating to `100` when the maximum logical range is `10`.
- **Payload**:
  ```json
  {
    "name": "RO",
    "category": "Membrane",
    "description": "Desc",
    "brineImpact": 100
  }
  ```

### Payload 12: Orphaned Reference Comment
- **Target**: `comments/orphaned`
- **Attempt**: Put an empty techId reference to create floating detached child nodes.
- **Payload**:
  ```json
  {
    "techId": "",
    "author": "Lost Scholar",
    "content": "What is this technology?"
  }
  ```

---

## 3. Test Suite: firestore.rules.test.ts

```typescript
import { assertFails, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, updateDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

describe("Firestore Rogue Payload Testing", () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "gen-lang-client-0548033335",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("should block Payload 1: ID Poisoning (>128 chars)", async () => {
    const unverifiedContext = testEnv.authenticatedContext("user_id", { email_verified: true });
    const longId = "a".repeat(150);
    const docRef = doc(unverifiedContext.firestore(), "technologies", longId);
    await assertFails(setDoc(docRef, { name: "Method", category: "Solar", description: "Desc" }));
  });

  it("should block Payload 2: Ghost Field Side-Loading", async () => {
    const context = testEnv.authenticatedContext("user_id", { email_verified: true });
    const docRef = doc(context.firestore(), "technologies", "test-osmosis");
    await assertFails(setDoc(docRef, { name: "RO", category: "Membrane", description: "Desc", isVerifiedAdminApproved: true }));
  });

  it("should block Payload 3: Invalid Type Escalation", async () => {
    const context = testEnv.authenticatedContext("user_id", { email_verified: true });
    const docRef = doc(context.firestore(), "technologies", "test-osmosis");
    await assertFails(setDoc(docRef, { name: "RO", category: "Membrane", description: "Desc", costRating: "SUPER HIGH EXPLOIT" }));
  });

  it("should block Payload 5: Anonymous Write", async () => {
    const context = testEnv.unauthenticatedContext();
    const docRef = doc(context.firestore(), "comments", "any-comment");
    await assertFails(setDoc(docRef, { techId: "ro", author: "Anon", content: "Hello" }));
  });

  it("should block Payload 6: Unverified Email", async () => {
    const context = testEnv.authenticatedContext("user_id", { email_verified: false });
    const docRef = doc(context.firestore(), "comments", "any-comment");
    await assertFails(setDoc(docRef, { techId: "ro", author: "Anon", content: "Hello" }));
  });

  it("should block Payload 8: Mutating an existing comment", async () => {
    const context = testEnv.authenticatedContext("user_key", { email_verified: true });
    const docRef = doc(context.firestore(), "comments", "existing-id");
    await assertFails(updateDoc(docRef, { content: "modified text" }));
  });
});
```
