<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## 🎯 DEMO MODE Configuration

This project supports **DEMO MODE** for easy demonstration and testing without relying on actual email delivery. This is especially useful for recruiters, demos, and development environments.

### Environment Variables

Add these to your `.env` file:

```env
# Set to 'demo' for development/demo mode, 'prod' for production
EMAIL_MODE=demo

# Set to 'true' to auto-verify users in demo mode (no email check needed)
DEMO_BYPASS_VERIFY=false
```

### Features

#### 1. **Email Link Logging** (`EMAIL_MODE=demo`)

When `EMAIL_MODE=demo`, all email verification and password reset links are:

- ✅ **Logged to console** with clear formatting
- ✅ **Included in API responses** for easy access
- ✅ **Still sent via Resend** (best practice: works if email succeeds)

**Example Console Output:**

```
================================================================================
🔗 [DEMO MODE] VERIFICATION EMAIL
📧 To: user@example.com
👤 Name: John Doe
🔑 Verification Link: http://localhost:8080/auth/verify-email?token=abc123...
✅ Click this link to verify (no email needed in demo)
================================================================================
```

**Example API Response (Register):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.\n🔗 [DEMO] Verification link included in response.",
  "verificationUrl": "http://localhost:8080/auth/verify-email?token=abc123...",
  "demoMode": true
}
```

#### 2. **Auto-Verify Users** (`DEMO_BYPASS_VERIFY=true`)

When enabled, users are automatically verified on registration:

- ✅ No email verification needed
- ✅ Can login immediately after registration
- ✅ Perfect for quick demos

**Example Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "isVerified": true,
  "message": "🎯 [DEMO MODE] Đăng ký thành công! Tài khoản đã được tự động xác thực (DEMO_BYPASS_VERIFY=true)"
}
```

### Affected Endpoints

| Endpoint                         | Demo Mode Behavior                                  |
| -------------------------------- | --------------------------------------------------- |
| `POST /auth/register`            | Returns `verificationUrl` in response + console log |
| `POST /auth/resend-verification` | Returns `verificationUrl` in response + console log |
| `POST /auth/forgot-password`     | Returns `resetUrl` in response + console log        |

### Production Mode

Set `EMAIL_MODE=prod` to disable demo features:

```env
EMAIL_MODE=prod
DEMO_BYPASS_VERIFY=false
```

In production mode:

- ❌ Links are NOT logged to console
- ❌ Links are NOT included in API responses
- ✅ Only email delivery is used

### Why This Approach?

✅ **Professional**: Shows understanding of dev/demo/prod environments  
✅ **Recruiter-Friendly**: No need to check email inbox during demos  
✅ **Robust**: Email still sends (works if configured correctly)  
✅ **Explicit**: Clear `[DEMO]` markers prevent confusion  
✅ **Production-Ready**: Easy to switch to prod mode

### Best Practice

> **Recommended Setting for Demos:**
>
> ```env
> EMAIL_MODE=demo
> DEMO_BYPASS_VERIFY=false
> ```
>
> This sends emails AND logs links, giving you both options without auto-bypassing verification flow.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
