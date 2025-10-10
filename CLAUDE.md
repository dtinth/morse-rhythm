# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based rhythm game called "morse-rhythm" that combines music and Morse code. The game mechanics work as follows:

1. Music plays synchronized with target text that the player needs to input
2. Visual/audio hints indicate when to press and release a button
3. Pressing the button emits sound (dits and dahs based on duration)
4. The sound patterns are decoded back into Morse code, then into text
5. The decoded text is checked against the target text for accuracy
6. Players are scored based on their accuracy

The game uses Web Audio API to synchronize the background song with a key sound that players can trigger.

## Development Commands

- **Start dev server**: `pnpm dev` (runs on port 18074 by default, or set PORT env var)
- **Build for production**: `pnpm build` (runs TypeScript compiler and Vite build)
- **Preview production build**: `pnpm preview` (runs on port 18074)
- **Lint code**: `pnpm lint`

## Architecture

### Tech Stack
- React 19 with TypeScript
- Vite for build tooling
- React Router (hash router) for navigation
- Nanostores for state management
- Web Audio API for audio playback

### Application Structure

**Router setup** (src/main.tsx): Uses HashRouter with two routes:
- `/` - Landing page (App component)
- `/game` - Game interface

**Game architecture** (src/Game.tsx):
- `GameController` class manages game state using nanostores atoms (`$ready`, `$started`)
- `GameAudio` class handles Web Audio API nodes and audio playback
  - Creates gain nodes for volume control
  - Manages two audio buffers: background song and key sound
  - Key audio gain is controlled by user input (0 when not pressed, 1 when pressed)
- Audio files are loaded from `/public/songs/{song-name}/` with two required files:
  - `song.ogg` - background music
  - `key.ogg` - sound played when button is pressed

**Audio synchronization**: Both audio buffers (song and key) start simultaneously. The key audio plays continuously but is muted (gain = 0) until the user presses the button, creating the illusion of triggering the sound while maintaining synchronization.

### Song Data

Songs are stored in `public/songs/` directory with each song in its own folder. Currently contains:
- `tutorial/` - Example song with song.ogg and key.ogg files

To add new songs, create a new folder under `public/songs/` with the same structure.

## Design System

### Color Scheme (src/index.css)
- **Background**: `#144741` (dark teal/forest green)
- **Text**: `#fff4d4` (warm off-white/cream)
- **Links**: `#e9c46b` (golden yellow/sand)

The color scheme uses a warm, earthy palette with high contrast for readability. Colors are based on the Polished Jam website: https://itch.io/jam/unpolished-jam-4
