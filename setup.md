Below are the detailed prompts for the Getting Started section of the serverless static website tech stack for your wealth projection app, tailored for your setup (Ubuntu, free version of Cursor IDE). These prompts guide you through setting up the recommended stack: Next.js (SSG) + Tailwind CSS + Shadcn/UI for the frontend, AWS Lambda + API Gateway for the backend, Amazon DynamoDB for the database, Auth0 or AWS Cognito for authentication, and Plaid/Alpha Vantage for financial APIs, deployed on Vercel with GitHub Actions for CI/CD. Each prompt is designed to work within Cursor IDE’s capabilities and assumes you’re using its free version (no advanced AI features needed beyond basic code editing and terminal support).
Getting Started Prompts
1. Initialize a Next.js Project with Tailwind CSS and Shadcn/UI

Goal: Set up a Next.js project with static site generation (SSG), Tailwind CSS for styling, and Shadcn/UI for reusable components.

Prompt for Cursor IDE:

    Open Cursor IDE on Ubuntu.
    Open the terminal in Cursor IDE (Ctrl+` or View > Terminal).
    Run the following command to create a Next.js project:
    bash

npx create-next-app@latest wealth-projection-app --typescript --tailwind --eslint --app --src-dir --no-experimental-app

    Select defaults for prompts (e.g., TypeScript, Tailwind, ESLint, App Router, src/ directory).

Navigate to the project folder:
bash
cd wealth-projection-app
Install Shadcn/UI:
bash
npx shadcn-ui@latest init

    Accept defaults or customize (e.g., choose “neutral” theme, TypeScript).

Add Shadcn/UI components (e.g., button, card for financial dashboards):
bash
npx shadcn-ui@latest add button card
Create a sample page in src/app/page.tsx:
tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Wealth Projection Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to your financial future!</p>
          <Button>Calculate Projection</Button>
        </CardContent>
      </Card>
    </div>
  );
}
Test locally:
bash

    npm run dev
        Open http://localhost:3000 in your browser to verify.

Notes:

    Cursor IDE’s IntelliSense will help with TypeScript and Tailwind completions.
    Save your project in a Git repository:
    bash

    git init
    git add .
    git commit -m "Initial Next.js setup"

2. Deploy Static Site to Vercel

Goal: Deploy the Next.js static site to Vercel for global CDN hosting.

Prompt for Cursor IDE:

    Install the Vercel CLI:
    bash

npm install -g vercel
Log in to Vercel:
bash
vercel login

    Follow prompts to authenticate (use your email or GitHub account; free tier is sufficient).

Deploy the project:
bash
vercel

    Accept defaults (project name: wealth-projection-app, framework: Next.js).
    Vercel will generate a URL (e.g., https://wealth-projection-app.vercel.app).

Configure static site generation in next.config.js (in project root):
js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
};
module.exports = nextConfig;
Redeploy to ensure SSG:
bash

    vercel --prod
    Verify the deployed site in your browser using the Vercel URL.

Notes:

    Vercel’s free tier supports 100GB bandwidth/month, sufficient for 20K users with static content.
    Push your code to a GitHub repository for CI/CD (see Step 6).

3. Set Up AWS Lambda Functions with Node.js

Goal: Create serverless functions for dynamic features (e.g., wealth projections, API calls).

Prompt for Cursor IDE:

    Install the AWS CLI:
    bash

sudo apt update
sudo apt install awscli
Configure AWS CLI:
bash
aws configure

    Enter your AWS Access Key, Secret Key, region (e.g., us-east-1), and output format (json). Get keys from AWS IAM console (create a user with Lambda and API Gateway permissions).

Install the Serverless Framework for easier Lambda setup:
bash
npm install -g serverless
Create a new Serverless project in a separate folder:
bash
mkdir wealth-projection-backend
cd wealth-projection-backend
serverless create --template aws-nodejs --name wealth-projection
Edit serverless.yml to define a Lambda function and API Gateway:
yaml
service: wealth-projection
provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
functions:
  calculateProjection:
    handler: handler.calculate
    events:
      - http:
          path: /calculate
          method: post
Create a sample Lambda function in handler.js:
js
module.exports.calculate = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const { principal, years, rate } = body;
  const futureValue = principal * Math.pow(1 + rate / 100, years); // Simple compound interest
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ futureValue }),
  };
};
Deploy to AWS:
bash
serverless deploy

    Note the API Gateway endpoint URL (e.g., https://<id>.execute-api.us-east-1.amazonaws.com/dev/calculate).

Test the endpoint using Curl in Cursor’s terminal:
bash

    curl -X POST https://<your-api-id>.execute-api.us-east-1.amazonaws.com/dev/calculate -d '{"principal": 10000, "years": 5, "rate": 5}'

Notes:

    Use AWS’s free tier (1M Lambda requests/month).
    Cursor’s terminal supports AWS CLI and Serverless commands.
    Secure the API with an API key or IAM roles later.

4. Configure DynamoDB Tables

Goal: Set up DynamoDB for storing user data and projections.

Prompt for Cursor IDE:

    In the AWS Management Console (or AWS CLI), create a DynamoDB table:
    bash

aws dynamodb create-table \
  --table-name UserProjections \
  --attribute-definitions AttributeName=UserId,AttributeType=S \
  --key-schema AttributeName=UserId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
Add a sample Lambda function to save projections (in handler.js):
js
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.saveProjection = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const { userId, projection } = body;
  await dynamoDB
    .put({
      TableName: "UserProjections",
      Item: { UserId: userId, Projection: projection },
    })
    .promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Projection saved" }),
  };
};
Update serverless.yml to add the new function and DynamoDB permissions:
yaml
functions:
  saveProjection:
    handler: handler.saveProjection
    events:
      - http:
          path: /save
          method: post
provider:
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:PutItem
      Resource: "arn:aws:dynamodb:us-east-1:*:table/UserProjections"
Redeploy:
bash
serverless deploy
Test with Curl:
bash

    curl -X POST https://<your-api-id>.execute-api.us-east-1.amazonaws.com/dev/save -d '{"userId": "user123", "projection": {"futureValue": 15000}}'

Notes:

    DynamoDB’s free tier (25GB, 25 read/write units) supports 20K users with light usage.
    Use Cursor’s code editor to debug JavaScript errors.

5. Integrate Auth0 or AWS Cognito

Goal: Add secure authentication for users.

Prompt for Cursor IDE (Using AWS Cognito):

    Create a Cognito User Pool in the AWS Console:
        User Pool Name: WealthProjectionUsers
        Attributes: Email, standard attributes.
        Enable MFA (optional) and password policy.
        Note the User Pool ID and Client ID.
    Install AWS Amplify in your Next.js project:
    bash

cd wealth-projection-app
npm install aws-amplify
Configure Amplify in src/app/_app.tsx or src/app/layout.tsx:
tsx
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    region: "us-east-1",
    userPoolId: "<your-user-pool-id>",
    userPoolWebClientId: "<your-client-id>",
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
Add a login component in src/app/login/page.tsx:
tsx
import { useState } from "react";
import { Auth } from "aws-amplify";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
      await Auth.signIn(email, password);
      alert("Logged in!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button onClick={signIn}>Log In</Button>
    </div>
  );
}
Redeploy to Vercel:
bash

    vercel --prod

Notes:

    Cognito’s free tier supports 50K monthly active users.
    Alternatively, use Auth0 (free for <7K users) with similar setup via its React SDK (npm install @auth0/auth0-react).

6. Integrate Plaid and Alpha Vantage

Goal: Add financial data integrations for bank accounts and market data.

Prompt for Cursor IDE:

    Sign up for Plaid and Alpha Vantage.
        Get API keys (Plaid: sandbox mode; Alpha Vantage: free key).
    Create a Lambda function for Plaid (in wealth-projection-backend/handler.js):
    js

const plaid = require("plaid");

const client = new plaid.PlaidApi({
  basePath: "https://sandbox.plaid.com",
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": "<your-client-id>",
      "PLAID-SECRET": "<your-secret>",
    },
  },
});

module.exports.getBalance = async (event) => {
  const { accessToken } = JSON.parse(event.body || "{}");
  const response = await client.accountsBalanceGet({ access_token: accessToken });
  return {
    statusCode: 200,
    body: JSON.stringify(response.data),
  };
};
Update serverless.yml:
yaml
functions:
  getBalance:
    handler: handler.getBalance
    events:
      - http:
          path: /balance
          method: post
Install Plaid SDK:
bash
cd wealth-projection-backend
npm install plaid
Redeploy:
bash
serverless deploy
In Next.js, add Plaid Link (frontend) in src/app/plaid/page.tsx:
tsx
import { usePlaidLink } from "react-plaid-link";
import { useEffect, useState } from "react";

export default function PlaidLink() {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    fetch("https://<your-api-id>.execute-api.us-east-1.amazonaws.com/dev/create_link_token", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => setLinkToken(data.link_token));
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token) => {
      console.log("Public Token:", public_token);
      // Exchange public_token for access_token via Lambda
    },
  });

  return <Button onClick={open} disabled={!ready}>Connect Bank</Button>;
}
For Alpha Vantage, add a Lambda function:
js
const axios = require("axios");

module.exports.getMarketData = async () => {
  const response = await axios.get(
    "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=<your-api-key>"
  );
  return {
    statusCode: 200,
    body: JSON.stringify(response.data),
  };
};
Update serverless.yml and install Axios:
bash

    npm install axios
    serverless deploy

Notes:

    Plaid’s sandbox is free; production costs ~$0.10–$0.50/transaction.
    Alpha Vantage’s free tier (500 calls/day) is sufficient for testing.

7. Set Up GitHub Actions for CI/CD

Goal: Automate deployments for frontend and backend.

Prompt for Cursor IDE:

    Create a GitHub repository for wealth-projection-app and push:
    bash

git remote add origin https://github.com/<your-username>/wealth-projection-app.git
git push -u origin main
Create .github/workflows/vercel.yml in wealth-projection-app:
yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
Get Vercel secrets from Vercel CLI:
bash
vercel secrets

    Add secrets to GitHub repository settings (Settings > Secrets and variables > Actions).

For the backend, create .github/workflows/serverless.yml in wealth-projection-backend:
yaml

    name: Deploy to AWS
    on:
      push:
        branches: [main]
    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
            with:
              node-version: 20
          - run: npm install
          - name: Deploy Serverless
            run: npx serverless deploy
            env:
              AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
              AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    Add AWS secrets to GitHub repository settings.

Notes:

    GitHub Actions free tier (2K minutes/month) is sufficient.
    Cursor IDE’s file explorer helps create workflow files.

Additional Notes

    Cost Optimization: Use AWS free tier (1M Lambda requests, 25GB DynamoDB) and Vercel’s free tier. Monitor usage via AWS CloudWatch or Vercel dashboard to stay under $100/month.
    Debugging: Use Cursor’s terminal for logs (serverless logs -f calculateProjection) and browser dev tools for frontend issues.
    Security: Enable HTTPS (automatic on Vercel) and secure API Gateway with API keys or Cognito.
    Next Steps: Test Plaid/Alpha Vantage integrations in sandbox mode. Optimize Lambda functions for cost (e.g., batch API calls).

For further details, check:

    AWS API pricing: https://x.ai/api (if using xAI services).
    Plaid pricing: https://plaid.com/pricing/.
    Alpha Vantage: https://www.alphavantage.co/support/#api-key.

Let me know if you need help with specific steps or debugging in Cursor IDE!
1.8s
give me the same in PDF downloadable
Message limit reached
Sign up to continue with Grok 3

Enjoy higher usage limits and more when you sign up for free.
More queries for Grok 3, Think, DeepSearch, and DeeperSearch
Store memories and reference them across chats
Process documents and edit images
Unlock features like projects, private chats, and more