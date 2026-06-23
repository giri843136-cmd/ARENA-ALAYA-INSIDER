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
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7]:
      - img [ref=e8]
    - generic [ref=e11]:
      - button "Open issues overlay" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "0"
          - generic [ref=e15]: "1"
        - generic [ref=e16]: Issue
      - button "Collapse issues badge" [ref=e17]:
        - img [ref=e18]
  - region "Trust indicators" [ref=e20]:
    - generic [ref=e22]:
      - generic [ref=e23]:
        - img [ref=e24]
        - generic [ref=e29]:
          - generic [ref=e30]: 50K+
          - generic [ref=e31]: Monthly Readers
      - generic [ref=e32]:
        - img [ref=e33]
        - generic [ref=e36]:
          - generic [ref=e37]: 200+
          - generic [ref=e38]: Products Tested
      - generic [ref=e39]:
        - img [ref=e40]
        - generic [ref=e42]:
          - generic [ref=e43]: "4.8"
          - generic [ref=e44]: Avg. Rating
      - generic [ref=e45]:
        - img [ref=e46]
        - generic [ref=e49]:
          - generic [ref=e50]: 100+
          - generic [ref=e51]: Editorial Essays
      - generic [ref=e52]:
        - img [ref=e53]
        - generic [ref=e56]:
          - generic [ref=e57]: 100%
          - generic [ref=e58]: Independent
  - generic [ref=e60]:
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e64]: A
        - generic [ref=e65]: ALAYA
      - heading "Welcome back" [level=1] [ref=e66]
      - paragraph [ref=e67]: Sign in to the ALAYA INSIDER admin panel
    - generic [ref=e68]:
      - generic [ref=e69]:
        - generic [ref=e70]:
          - generic [ref=e71]: Email address
          - textbox "Email address" [ref=e72]:
            - /placeholder: you@example.com
        - generic [ref=e73]:
          - generic [ref=e74]: Password
          - generic [ref=e75]:
            - textbox "Password" [ref=e76]:
              - /placeholder: Enter your password
            - button [ref=e77]:
              - img [ref=e78]
        - button "Sign in" [disabled] [ref=e81]:
          - img [ref=e82]
          - text: Sign in
      - generic [ref=e89]: Or continue with
      - button "Google" [ref=e90]:
        - img [ref=e91]
        - text: Google
      - button "Send magic link to your email" [disabled] [ref=e97]:
        - img [ref=e98]
        - text: Send magic link to your email
    - paragraph [ref=e100]:
      - text: By signing in, you agree to our
      - link "Terms" [ref=e101] [cursor=pointer]:
        - /url: /terms
      - text: and
      - link "Privacy Policy" [ref=e102] [cursor=pointer]:
        - /url: /privacy
  - region "Notifications alt+T"
  - alert [ref=e103]
```