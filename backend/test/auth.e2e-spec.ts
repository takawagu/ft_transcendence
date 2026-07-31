import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const runId = Date.now();
  const testEmail = (tag: string) => `e2etest_${runId}_${tag}@example.com`;
  const testUsername = (tag: string) => `e2etest_${runId}_${tag}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: `e2etest_${runId}_` } },
    });
    await app.close();
  });

  it('rejects registration with a password shorter than 8 characters', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail('shortpw'),
        username: testUsername('shortpw'),
        password: 'short',
      })
      .expect(400);
  });

  it('rejects registration with an invalid email', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        username: testUsername('bademail'),
        password: 'password123',
      })
      .expect(400);
  });

  it('registers successfully with valid input and returns a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail('valid'),
        username: testUsername('valid'),
        password: 'password123',
      })
      .expect(201);

    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.username).toBe(testUsername('valid'));
  });

  it('rejects duplicate registration with the same email/username', async () => {
    const email = testEmail('dup');
    const username = testUsername('dup');

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, username, password: 'password123' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, username, password: 'password123' })
      .expect(409);
  });

  it('check-username reflects taken/available state', async () => {
    const username = testUsername('checkme');

    const before = await request(app.getHttpServer())
      .get(`/api/auth/check-username?username=${username}`)
      .expect(200);
    expect(before.body.taken).toBe(false);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: testEmail('checkme'), username, password: 'password123' })
      .expect(201);

    const after = await request(app.getHttpServer())
      .get(`/api/auth/check-username?username=${username}`)
      .expect(200);
    expect(after.body.taken).toBe(true);
  });

  it('check-email reflects taken/available state', async () => {
    const email = testEmail('checkemail');

    const before = await request(app.getHttpServer())
      .get(`/api/auth/check-email?email=${email}`)
      .expect(200);
    expect(before.body.taken).toBe(false);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, username: testUsername('checkemail'), password: 'password123' })
      .expect(201);

    const after = await request(app.getHttpServer())
      .get(`/api/auth/check-email?email=${email}`)
      .expect(200);
    expect(after.body.taken).toBe(true);
  });

  it('logs in successfully with correct credentials', async () => {
    const email = testEmail('login');
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, username: testUsername('login'), password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);
  });

  it('rejects login with the wrong password', async () => {
    const email = testEmail('wrongpw');

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, username: testUsername('wrongpw'), password: 'password123' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'wrongpassword' })
      .expect(401);
  });
});
