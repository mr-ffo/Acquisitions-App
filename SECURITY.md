# Security Architecture

This document explains the security strategy for this acquisition application, including Arcjet, authentication, validation, and logging standards.

## Security Objectives

* Prevent unauthorized access
* Mitigate brute-force and DDoS attacks
* Validate user inputs to prevent injection attacks
* Secure authentication and session management
* Enable security monitoring and audit trails

---

## ✅ Core Security Stack

| Tool / Library         | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| **Arcjet**             | API security, rate limiting, abuse protection |
| **Helmet**             | Sets secure HTTP headers                      |
| **CORS**               | Controls which domains can access the API     |
| **bcrypt**             | Password hashing                              |
| **jsonwebtoken (JWT)** | User authentication                           |
| **Zod**                | Input validation schema                       |
| **Winston**            | Security and app logging                      |
| **Morgan**             | HTTP request logs                             |

---

## 🔐 Arcjet Security

Arcjet protects the API with:

* **Rate limiting** (stop brute force attacks)
* **Request fingerprinting** (block malicious automation)
* **Abuse protection** (detect repeated attacks)

Arcjet will wrap authentication routes like this:

```js
import arcjet from "@arcjet/node";

const aj = arcjet({ key: process.env.ARCJET_KEY });

app.post('/auth/login', aj.rateLimit(), loginController);
```

Arcjet can later be used on other services like:

* **Payment Service** → protect `/payment/charge`
* **File Upload Service** → prevent abuse
* **Admin Routes** → restrict attack surfaces

---

## 🔐 Authentication Security (JWT + Cookies)

* Access tokens are **signed** using `jsonwebtoken`
* Tokens stored in **HTTP-only cookies** to block XSS
* Short token expiry + refresh token rotation
* Request identity enforced using `authMiddleware`

```js
res.cookie('token', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
});
```

---

## 🔑 Password Security (bcrypt)

* Passwords are hashed with `bcrypt`
* Configurable salt rounds
* No plaintext passwords saved or logged

---

## 🛡 Input Validation (Zod)

Every request body must be validated:

```js
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
```

---

## 🧱 HTTP Security Layer (Helmet + CORS)

* Helmet enables:

    * frameguard
    * xssFilter
    * noSniff
    * hidePoweredBy
* CORS whitelist for allowed domains

---

## 🔭 Logging & Monitoring (Winston + Morgan)

* Winston logs errors and security events
* Morgan logs HTTP requests
* Log levels enabled: info, warn, error
* Logs will later push to **CloudWatch** or **Elastic Stack**

---

## Future Security Enhancements

* ✅ CSRF Protection
* ✅ Role-Based Access Control (RBAC)
* ✅ IP-based access control via Arcjet rules
* ✅ Security headers strict enforcement
* ✅ AWS WAF when hosting

---

## Security Workflow

1. Validate request body (Zod)
2. Authenticate user (JWT)
3. Rate limit using Arcjet
4. Authorization check (RBAC)
5. Execute controller logic
6. Log result (Winston)

---

If you find a vulnerability, report it immediately to the security team or create a private issue.

By Folarin Favour Olaoluwapo
