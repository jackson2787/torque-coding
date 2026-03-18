---
name: legal-compliance-checker
description: Use when making decisions about data handling, privacy policies, user rights, content compliance, contract terms, or any feature that touches regulated areas like GDPR, CCPA, HIPAA, PCI-DSS, or SOX.
---

# Legal Compliance Checker

## Overview

Regulatory violations destroy businesses faster than bad architecture. Non-compliance with GDPR alone carries fines up to 4% of global annual revenue. Compliance is not optional and cannot be retrofitted.

**Core Principle:** Compliance requirements MUST be identified and addressed BEFORE implementation begins. Every feature that collects, processes, or stores user data is a regulatory surface. Treat it as such.

**Violating the letter of these rules is violating the spirit of legal compliance.**

## The Iron Law

```
NO DATA COLLECTION WITHOUT DOCUMENTED LEGAL BASIS
NO USER DATA PROCESSING WITHOUT CONSENT MANAGEMENT AND RIGHTS IMPLEMENTATION
NO CROSS-BORDER DATA TRANSFER WITHOUT ADEQUATE SAFEGUARDS
NO LAUNCH WITHOUT COMPLIANCE VALIDATION ACROSS ALL APPLICABLE JURISDICTIONS
```

If your implementation violates any of these, stop and remediate.

## When to Use

Use for ANY decision that touches regulated territory:
- Collecting, storing, or processing personal data
- Building user authentication, profiles, or account systems
- Implementing payment processing or financial features
- Creating privacy policies, terms of service, or cookie banners
- Reviewing vendor contracts or third-party data sharing agreements
- Handling health, education, financial, or biometric data
- Expanding operations to new jurisdictions

**Use this ESPECIALLY when:**
- Adding new data collection fields or tracking mechanisms
- Integrating third-party analytics, advertising, or data processors
- Designing data retention or deletion workflows
- Building features that affect user consent or communication preferences
- Preparing for external audits or regulatory reviews

**Don't skip when:**
- "It's just analytics" (analytics collect personal data—IP addresses, device IDs, behavioral patterns)
- "We're too small for GDPR" (GDPR applies based on data subjects' location, not company size)
- "We'll add a privacy policy later" (processing data without documented legal basis is already a violation)
- "It's only internal data" (employee data has its own regulatory requirements)

## The Four Pillars

You MUST address all applicable pillars for every feature that touches user data.

### Pillar 1: Data Protection and Privacy

**BEFORE collecting any personal data:**

1. **Identify Legal Basis**
   - Document which GDPR Article 6(1) basis applies to each processing activity
   - Consent must be freely given, specific, informed, and unambiguous
   - Legitimate interests require a documented balancing test
   - Never default to "consent" when "contract performance" is the actual basis

2. **Apply Privacy by Design**
   - Data minimization: collect only what is strictly necessary
   - Purpose limitation: use data only for the stated purpose
   - Storage limitation: define and enforce retention periods
   - Accuracy: implement mechanisms to keep data current
   - Integrity and confidentiality: encrypt at rest and in transit

3. **Implement Data Subject Rights**
   - Right of access: export user data within 30 days
   - Right to rectification: allow users to correct their data
   - Right to erasure: delete user data on valid request (with documented exceptions)
   - Right to portability: provide data in machine-readable format (JSON)
   - Right to object: honor opt-out requests immediately

4. **Required Data Categories Documentation**
   ```yaml
   data_category:
     type: [personal_identifiers | behavioral | sensitive | financial]
     fields: [specific fields collected]
     legal_basis: [consent | contract | legitimate_interests | legal_obligation]
     retention_period: [duration with justification]
     encryption: [at_rest | in_transit | both]
     access_controls: [who can access and why]
     deletion_procedure: [how data is purged when retention expires]
   ```

### Pillar 2: Multi-Jurisdictional Compliance

**Map applicable regulations BEFORE implementation:**

| Regulation | Scope | Key Requirements | Penalties |
|-----------|-------|-----------------|-----------|
| **GDPR** | EU/EEA residents | Legal basis, DPO, breach notification (72h), DPIAs | Up to 4% global revenue or €20M |
| **CCPA/CPRA** | California residents | Right to know, delete, opt-out of sale; 12-month lookback | $2,500-$7,500 per violation |
| **HIPAA** | US health data | PHI safeguards, BAAs, breach notification, minimum necessary | Up to $1.5M per violation category/year |
| **PCI-DSS** | Payment card data | Network security, encryption, access control, monitoring | $5,000-$100,000/month until compliant |
| **SOX** | US public companies | Internal controls, audit trails, financial reporting integrity | Criminal penalties, up to 20 years |

**Cross-border data transfers require:**
- Standard Contractual Clauses (SCCs) or adequacy decisions for EU data
- Transfer Impact Assessments documenting safeguards
- Data residency compliance where local law mandates it

### Pillar 3: Contract and Policy Compliance

**Every user-facing legal document MUST include:**

1. **Privacy Policy Requirements**
   - What data is collected and why (specific, not vague)
   - Legal basis for each processing activity
   - Third parties who receive data and why
   - Retention periods per data category
   - User rights and how to exercise them
   - Contact information for DPO or privacy team
   - Cookie and tracking technology disclosures
   - Jurisdiction-specific sections (GDPR for EU, CCPA for California)

2. **Contract Review Checklist**
   - Liability caps (mutual, at 12 months of fees)
   - Data Processing Agreements covering GDPR Article 28
   - Termination rights with data return/deletion provisions
   - Security obligations and audit rights
   - Indemnification scope and carve-outs
   - Governing law and dispute resolution

3. **Risk Keywords That Require Legal Review**

   | Risk Level | Terms | Action |
   |-----------|-------|--------|
   | **HIGH** | Unlimited liability, personal guarantee, indemnification, liquidated damages, non-compete | Legal counsel review required |
   | **MEDIUM** | IP assignment, confidentiality, data processing, termination rights, governing law | Manager approval required |
   | **COMPLIANCE** | GDPR, CCPA, HIPAA, data protection, audit rights, regulatory compliance | Compliance team review required |

### Pillar 4: Incident Response and Breach Management

**Every system handling personal data MUST have:**

1. **Breach Detection and Response**
   - Detection mechanisms with automated alerting
   - GDPR: notify supervisory authority within 72 hours of awareness
   - GDPR: notify affected data subjects "without undue delay" if high risk
   - CCPA: notify affected consumers if unencrypted data is breached
   - HIPAA: notify HHS within 60 days, individuals without unreasonable delay

2. **Documentation Requirements**
   - Maintain breach register with all incidents (even contained ones)
   - Document investigation findings, scope, and remediation
   - Record notification decisions with legal reasoning
   - Preserve evidence for potential regulatory inquiry

3. **Remediation Protocol**
   - Contain the breach immediately
   - Assess scope and severity
   - Notify as required by applicable regulations
   - Implement corrective measures
   - Conduct post-incident review and update controls

## Compliance Assessment Template

When evaluating compliance posture, use this structure:

```markdown
## Compliance Assessment: [Feature/System Name]

**Applicable Regulations**: [List with justification]
**Data Categories**: [Personal, sensitive, financial, health]
**Risk Level**: [HIGH/MEDIUM/LOW with reasoning]

**Data Protection**:
- Legal basis: [Documented per processing activity]
- Retention: [Defined periods with deletion procedures]
- User rights: [Implementation status per right]
- Encryption: [At rest and in transit status]

**Jurisdictional Requirements**:
- [Regulation]: [Compliant/Gap identified/Not applicable]

**Contract/Policy Status**:
- Privacy policy: [Current/Needs update/Gap]
- Terms of service: [Current/Needs update/Gap]
- DPAs with processors: [In place/Missing/Needs update]

**Gaps and Remediation**:
1. [Gap] - Risk: [Level] - Remediation: [Action] - Timeline: [Days]

**Compliance Score**: [X]/100 (target: 95+)
```

## Integration with AGENTS.md

When utilizing this skill within the `AGENTS.md` workflow lifecycle:

- **PLAN State**: Identify all applicable regulations before architecture decisions. Document data flows, legal basis, and jurisdictional requirements. Flag any feature that requires compliance review.
- **BUILD State**: Implement consent management, data subject rights, encryption, and access controls. Ensure privacy policies and legal documents are complete before launch.
- **QA State**: Validate compliance controls against regulatory requirements. Test user rights workflows (access, deletion, portability). Verify breach notification procedures.
- **DOCS State**: Update compliance documentation, data processing records, and policy version history. Document all compliance decisions with regulatory citations.

## Red Flags - STOP and Remediate

If you catch yourself doing any of these:

| Red Flag | Why It's Wrong |
|----------|---------------|
| Collecting data without documented legal basis | GDPR violation from moment of collection. Cannot be fixed retroactively. |
| No consent mechanism for optional processing | Consent must be obtained BEFORE processing, not after. |
| Storing data with no defined retention period | Storage limitation principle violation. Data hoarding is a liability. |
| No data deletion workflow | Right to erasure is legally mandated. "We can't delete it" is not acceptable. |
| Privacy policy that says "we may share with partners" | Must name specific categories of recipients and purposes. Vague language fails. |
| Processing children's data without COPPA/age verification | Children's data has strict additional requirements in every jurisdiction. |
| Cross-border transfer without SCCs or adequacy | Illegal data transfer. Fines are per-transfer, not per-system. |
| No breach notification procedure | 72-hour GDPR clock starts at awareness. No procedure = guaranteed late notification. |
| "We'll handle compliance after launch" | You are already non-compliant. Every day of operation increases liability. |

**ALL of these mean: STOP. Remediate before proceeding.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "We're a startup, regulations don't apply yet" | Regulations apply based on what data you process, not company size. |
| "Our users agreed to the terms" | Buried consent in ToS is not valid GDPR consent. Must be specific and informed. |
| "We anonymize the data" | True anonymization is extremely difficult. Pseudonymized data is still personal data under GDPR. |
| "We only store emails" | Email addresses are personal data. Full compliance obligations apply. |
| "Our vendor handles compliance" | You are the data controller. Vendor non-compliance is YOUR liability. |
| "Nobody actually enforces this" | GDPR fines exceeded €4B cumulative by 2024. Enforcement is real and increasing. |
| "We can fix it if we get audited" | Retroactive compliance is orders of magnitude more expensive than building it in. |

## Quick Reference

| Pillar | Key Requirements | Success Metric |
|--------|-----------------|----------------|
| **Data Protection** | Legal basis, privacy by design, data subject rights, encryption | Zero unlawful processing activities |
| **Multi-Jurisdictional** | Regulation mapping, cross-border safeguards, local requirements | 98%+ compliance score across all frameworks |
| **Contract/Policy** | Privacy policy, ToS, DPAs, contract review | Zero critical gaps in legal documents |
| **Incident Response** | Breach detection, 72h notification, remediation, documentation | 100% of breaches handled within regulatory timelines |

## Related Skills

- **backend-architect** - For implementing security controls, encryption, and access management at the infrastructure level
- **supabase-postgres-best-practices** - For Row-Level Security, data encryption, and access control in Postgres
- **verification-before-completion** - Verify compliance requirements are met before claiming completion
