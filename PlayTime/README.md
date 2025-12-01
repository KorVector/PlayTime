# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

While this project uses React, Vite supports many popular JS frameworks. [See all the supported frameworks](https://vitejs.dev/guide/#scaffolding-your-first-vite-project).

## Features

### Authentication Required Features

The following features require user authentication (login):

- **찜하기 (Favorites)**: Users must be logged in to add or remove movies from their favorites list. Clicking the heart icon while not logged in will prompt the user to log in.
- **MY 찜 보기 (View Favorites)**: Viewing the favorites list requires authentication. Clicking this button while not logged in will prompt the user to log in.
- **채팅 (Chat)**: All chat-related features require authentication.

### Header Behavior

The header component has scroll-based visibility:

- **Scroll Down**: When the user scrolls down past 50px, the header will hide automatically.
- **Scroll Up**: When the user scrolls up, the header will reappear.
- **Dropdown/Menu Open**: The header stays visible when the dropdown menu or mobile menu is open.
- **Focus Inside Header**: The header stays visible when focus is inside the header area.
- **Chat Pages**: On chat-related pages, the header uses mouse-based visibility instead (showing when mouse is near the top of the screen).

## Deploy Your Own

Deploy your own Vite project with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/framework-boilerplates/vite-react&template=vite-react)

_Live Example: https://vite-react-example.vercel.app_

### Deploying From Your Terminal

You can deploy your new Vite project with a single command from your terminal using [Vercel CLI](https://vercel.com/download):

```shell
$ vercel
```
