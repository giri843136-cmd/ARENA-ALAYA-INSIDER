# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ..\accessibility\admin.a11y.test.ts >> admin page meets WCAG AAA
- Location: tests\accessibility\admin.a11y.test.ts:4:5

# Error details

```
AssertionError: 4 accessibility violations were detected

4 !== 0

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - img [ref=e3]
    - generic [ref=e10]: You're offline — some features may be unavailable.
    - button "Retry" [ref=e11]:
      - img [ref=e12]
      - text: Retry
  - region "Trust indicators" [ref=e17]:
    - generic [ref=e19]:
      - generic [ref=e20]:
        - img [ref=e21]
        - generic [ref=e26]:
          - generic [ref=e27]: 50K+
          - generic [ref=e28]: Monthly Readers
      - generic [ref=e29]:
        - img [ref=e30]
        - generic [ref=e33]:
          - generic [ref=e34]: 200+
          - generic [ref=e35]: Products Tested
      - generic [ref=e36]:
        - img [ref=e37]
        - generic [ref=e39]:
          - generic [ref=e40]: "4.8"
          - generic [ref=e41]: Avg. Rating
      - generic [ref=e42]:
        - img [ref=e43]
        - generic [ref=e46]:
          - generic [ref=e47]: 100+
          - generic [ref=e48]: Editorial Essays
      - generic [ref=e49]:
        - img [ref=e50]
        - generic [ref=e53]:
          - generic [ref=e54]: 100%
          - generic [ref=e55]: Independent
  - generic [ref=e57]:
    - generic [ref=e58]:
      - generic [ref=e59]:
        - generic [ref=e61]: A
        - generic [ref=e62]: ALAYA
      - heading "Welcome back" [level=1] [ref=e63]
      - paragraph [ref=e64]: Sign in to the ALAYA INSIDER admin panel
    - generic [ref=e65]:
      - generic [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]: Email address
          - textbox "Email address" [ref=e69]:
            - /placeholder: you@example.com
        - generic [ref=e70]:
          - generic [ref=e71]: Password
          - generic [ref=e72]:
            - textbox "Password" [ref=e73]:
              - /placeholder: Enter your password
            - button [ref=e74]:
              - img [ref=e75]
        - button "Sign in" [disabled] [ref=e78]:
          - img [ref=e79]
          - text: Sign in
      - generic [ref=e86]: Or continue with
      - button "Google" [ref=e87]:
        - img [ref=e88]
        - text: Google
      - button "Send magic link to your email" [disabled] [ref=e94]:
        - img [ref=e95]
        - text: Send magic link to your email
    - paragraph [ref=e97]:
      - text: By signing in, you agree to our
      - link "Terms" [ref=e98] [cursor=pointer]:
        - /url: /terms
      - text: and
      - link "Privacy Policy" [ref=e99] [cursor=pointer]:
        - /url: /privacy
  - region "Notifications alt+T"
```