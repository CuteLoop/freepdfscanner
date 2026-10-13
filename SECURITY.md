# PDF3000 security

## Security model

PDF3000 is a static, client-side application. Selected images are decoded in the
browser, PDF bytes are generated locally, and document content is never sent to a
PDF3000 server. The service worker caches only the public application shell; it
does not persist selected images or generated PDFs.

The only intentional third-party navigation is the optional JustGiving fundraiser
link. It opens in a separate browsing context with `noopener noreferrer`. PDF3000
does not treat a referral click as a donation and does not receive payment or donor
data.

## Deployment controls

The GitHub Pages workflow:

- validates pull requests but deploys only `main` pushes or an authorized manual
  dispatch;
- gives the build/test job read-only repository access;
- gives Pages and OIDC write permissions only to the isolated deployment job;
- deploys an explicit allowlist of static files rather than the whole repository;
- pins every external action to a full commit SHA; and
- runs syntax, manifest, and PDF regression checks before publishing.

Dependabot monitors the pinned GitHub Actions dependencies. Updates should be
reviewed before merging; the human-readable version comments are descriptive, while
the commit SHA is the code that actually executes.

## Reporting a vulnerability

Please avoid posting document samples, personal data, or exploit details in a public
issue. Use the repository's **Security → Report a vulnerability** flow to open a
private security advisory:

https://github.com/CuteLoop/freepdfscanner/security/advisories/new

Include the affected browser/version, reproduction steps using non-sensitive test
images, impact, and any suggested remediation.
