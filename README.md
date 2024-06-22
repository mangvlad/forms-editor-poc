# Forms Editor POC

This is a proof of concept for a forms editor application built with React and deployed to Cloudflare Pages using GitHub Actions.

## Setup

1. Create a new repository on GitHub and push this project to it.
2. Set up a Cloudflare Pages project:
   - Go to the Cloudflare dashboard and create a new Pages project.
   - Connect your GitHub repository to the Pages project.
   - Set the build command to `npm run build` and the build output directory to `build`.
3. Add the following secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Development

Run `npm start` to start the development server.

## Deployment

Push changes to the `main` branch to trigger the CI/CD pipeline and deploy to Cloudflare Pages.
