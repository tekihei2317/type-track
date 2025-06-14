# CLAUDE.md

質問には日本語で返答してください。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Type-track is a typing practice application designed for repetitive training and spaced repetition. The application targets typists who want to practice specific words and patterns rather than random words.

Key features planned:
- Basic practice mode with individual word training
- Practical practice mode with timed sessions
- Performance analysis and statistics tracking
- Word filtering and search capabilities
- Spaced repetition system for reviewing difficult words

## Technology Stack

- **Framework**: React with TanStack Router
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (planned)
- **Language**: TypeScript (assumed based on modern React setup)

## Development Priority

The project follows an iterative approach, prioritizing functionality over design and data persistence initially:

1. **High Priority**: Core typing practice screens
   - Basic practice mode (individual word training)
   - Practical practice mode (timed sessions)

2. **Medium Priority**: Results and history screens
   - Basic practice results
   - Practical practice results

3. **Low Priority**: Analysis features
   - Word detail screens
   - Dashboard
   - Statistics screens

## Data Models

Core entities include:
- **Topics** (お題): Collections of words for practice
- **Words** (ワード): Individual typing exercises with readings
- **Word Practice Records**: Individual word training sessions with keystroke timing
- **Practical Practice Records**: Timed practice sessions with performance metrics

## Development Notes

- Start with simple UI design, plan for shadcn/ui integration later
- Focus on typing experience and comfort over visual polish initially
- Data persistence can be implemented after core functionality is working
- The app should support both sequential practice (TypeLighter style) and spaced repetition
