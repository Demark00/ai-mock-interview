# HirePath - AI Mock Interview Platform

## Overview

HirePath is an AI-powered mock interview platform that helps users prepare for technical and behavioral interviews through realistic AI-driven interview sessions. Users can generate customized interviews, interact with an AI interviewer using voice, and receive detailed feedback with performance scores across multiple evaluation categories.

The platform leverages modern web technologies, generative AI, and voice interaction to create an engaging interview preparation experience.

---

```

## Installation

```bash
git clone https://github.com/Demark00/ai-mock-interview.git

cd mock_interview

npm install

npm run dev
```

---

## Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

GOOGLE_GENERATIVE_AI_API_KEY=

NEXT_PUBLIC_VAPI_API_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
```

---

## Features

### Authentication

* Secure user authentication using Firebase Authentication
* User-specific interview sessions
* Protected routes and personalized dashboard

### AI Interview Generation

* Generate interview questions using Google Gemini AI
* Customize interviews based on:

  * Job role
  * Experience level
  * Interview type
* Dynamic interview content generation

### Voice-Based Interviews

* Real-time voice conversations using Vapi
* Speech-to-text transcription
* AI-powered interviewer responses
* Interactive interview experience

### AI Feedback System

Receive detailed interview analysis including:

* Overall Interview Score
* Communication Skills Assessment
* Technical Knowledge Evaluation
* Problem Solving Analysis
* Personalized improvement suggestions
* Category-wise comments and scores

### Interview Review

* View generated feedback
* Analyze strengths and weaknesses
* Track interview performance

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend & Services

* Next.js Server Actions
* Firebase Authentication
* Firebase Firestore

### AI & Voice

* Google Gemini AI
* Vapi AI

### Validation

* Zod

---

## Project Architecture

### Interview Flow

1. User signs in
2. User creates an interview
3. Gemini generates interview questions
4. Vapi starts voice conversation
5. User answers questions
6. Responses are collected
7. Gemini analyzes performance
8. Structured feedback is generated
9. Results are displayed to the user

---

## Author

Built as an AI-powered interview preparation platform using Next.js, TypeScript, Firebase, Gemini AI, and Vapi AI.
