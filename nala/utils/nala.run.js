#!/usr/bin/env node

/* eslint-disable no-console */

const { spawn } = require('child_process');

function displayHelp() {
  console.log(`

\x1b[1m\x1b[37m## Nala command:\x1b[0m \x1b[1m\x1b[32mnpm run nala [env] [unitylibs=<feature-branch>] [options]\x1b[0m

\x1b[1m1] Env:\x1b[0m [\x1b[32mmain\x1b[0m | \x1b[32mstage\x1b[0m | \x1b[32metc\x1b[0m ] \x1b[3mdefault: local\x1b[0m

\x1b[1m2] Options:\x1b[0m

  \x1b[33m* browser=<chrome|firefox|webkit>\x1b[0m    Browser to run the test in
  \x1b[33m* device=<desktop|mobile>\x1b[0m            Device type to run the test on
  \x1b[33m* test=<.test.js>\x1b[0m                    Specific test file to run (runs all tests in the file)
  \x1b[33m* -g, --g=<@tag>\x1b[0m                     Annotation Tag to filter and run tests by annotation (e.g., @test1, @pdf-express, @pdf-editor)
  \x1b[33m* mode=<headless|ui|debug|headed>\x1b[0m    Mode (default: headless)
  \x1b[33m* config=<config-file>\x1b[0m               Custom configuration file to use (default: Playwright's default)
  \x1b[33m* project=<project-name>\x1b[0m             Project configuration (default: unity-live-chromium)
  \x1b[33m* unitylibs=<local|prod|code|feature>\x1b[0m Unity library environment (default: none)
  \x1b[33m* owner=<repo-owner>\x1b[0m                 repo owner (default owner = adobecom) 

\x1b[1mExamples:\x1b[0m
  | \x1b[36mCommand\x1b[0m                                                | \x1b[36mDescription\x1b[0m                                                                        |
  |--------------------------------------------------------|------------------------------------------------------------------------------------|
  | npm run nala stage unitylibs=<feature-branch>          | Runs all unity nala tests on DC stage and unity feature branch  on chrome browser  |
  | npm run nala stage pdf-expres.test.js                  | Runs all pdf-expres tests on DC stage and unity feature branch  on chrome browser  |
  | npm run nala stage @pdf-express                        | Runs only pdf-expres annotated/tagged tests on DC stage and unity feature branch on chrome browser  |
  | npm run nala main @pdf-express browser=firefox         | Runs only pdf-express annotated/tagged tests on DC main on firefox browser         |
  | npm run nala main unitylibs=<local> mode=ui            | Runs all unity nala tests on DC main and unity local environment in UI mode on chrome browser       |
  | npm run nala main -g=@pdf-express                      | Runs tests annotated with tag i.e @pdf-express on local env on chrome browser        |
  | npm run nala <dc-branch> unitylibs=<feature-branch>    | Runs all unity tests on DC feature-branch and unity feature branch on Firefox browser| 

\x1b[1mDebugging:\x1b[0m
-----------
  | \x1b[36mCommand\x1b[0m                                                | \x1b[36mDescription\x1b[0m                                                                        |
  |--------------------------------------------------------|------------------------------------------------------------------------------------|
  | npm run nala stage unitylibs=<local> @test1 mode=debug | Runs @test1 on DC stage and unity local environment in debug mode                  |

`);
}

function parseArgs(args) {
  const defaultParams = {
    env: 'local',
    browser: 'chromium',
    device: 'desktop',
    test: '',
    tag: '',
    mode: 'headless',
    config: '',
    project: '',
    unitylibs: '',
    repo: 'da-dc',
    owner: 'adobecom',
  };

  const parsedParams = { ...defaultParams };

  args.forEach((arg) => {
    if (arg.includes('=')) {
      const [key, value] = arg.split('=');
      parsedParams[key] = value;
    } else if (arg.startsWith('-g') || arg.startsWith('--g')) {
      const value = arg.includes('=') ? arg.split('=')[1] : args[args.indexOf(arg) + 1];
      parsedParams.tag = value;
    } else if (arg.startsWith('@')) {
      parsedParams.tag += parsedParams.tag ? ` ${arg.substring(1)}` : arg.substring(1);
    } else if (arg.endsWith('.test.js')) {
      parsedParams.test = arg;
    } else if (arg.endsWith('.config.js')) {
      parsedParams.config = arg;
    } else if (['ui', 'debug', 'headless', 'headed'].includes(arg)) {
      parsedParams.mode = arg;
    } else if (arg.startsWith('repo=')) {
      const repo = arg.split('=')[1];
      parsedParams.repo = repo || 'da-dc';
    } else if (arg.startsWith('owner=')) {
      const owner = arg.split('=')[1];
      parsedParams.owner = owner || 'adobecom';
    } else {
      parsedParams.env = arg;
    }
  });

  // Set the project if not provided
  if (!parsedParams.project) {
    parsedParams.project = `da-dc-live-${parsedParams.browser}`;
  }
  console.log(`Parsed params: ${JSON.stringify(parsedParams)}`);
  return parsedParams;
}

function getLocalTestLiveUrl(env, unitylibs, repo = 'da-dc', owner = 'adobecom') {
  if (unitylibs) {
    process.env.UNITY_LIBS = `?unitylibs=${unitylibs}`;
    if (env === 'local') {
      return 'http://127.0.0.1:3000';
    } if (env === 'libs') {
      return 'http://127.0.0.1:6456';
    }
    return `https://${env}--${repo}--${owner}.aem.live`;
  }
  if (env === 'local') {
    return 'http://127.0.0.1:3000';
  } if (env === 'libs') {
    return 'http://127.0.0.1:6456';
  }
  return `https://${env}--${repo}--${owner}.aem.live`;
}

function buildPlaywrightCommand(parsedParams, localTestLiveUrl) {
  const {
    browser, device, test, tag, mode, config, project,
  } = parsedParams;

  const envVariables = {
    ...process.env,
    BROWSER: browser,
    DEVICE: device,
    HEADLESS: mode === 'headless' || mode === 'headed' ? 'true' : 'false',
    LOCAL_TEST_LIVE_URL: localTestLiveUrl,
  };

  const command = 'npx playwright test';
  const options = [];

  if (test) {
    options.push(test);
  }

  options.push(`--project=${project}`);
  options.push('--grep-invert nopr');

  if (tag) {
    options.push(`-g "${tag.replace(/,/g, ' ')}"`);
  }

  if (mode === 'ui' || mode === 'headed') {
    options.push('--headed');
  } else if (mode === 'debug') {
    options.push('--debug');
  }

  if (config) {
    options.push(`--config=${config}`);
  }

  return { finalCommand: `${command} ${options.join(' ')}`, envVariables };
}

function runNalaTest() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('help')) {
    displayHelp();
    process.exit(0);
  }

  const parsedParams = parseArgs(args);
  const localTestLiveUrl = getLocalTestLiveUrl(parsedParams.env, parsedParams.unitylibs, parsedParams.repo, parsedParams.owner);
  const { finalCommand, envVariables } = buildPlaywrightCommand(parsedParams, localTestLiveUrl);

  console.log(`\n Executing nala run command: ${finalCommand}`);
  console.log(`\n Using URL: ${localTestLiveUrl}\n`);
  console.log(`\n\x1b[1m\x1b[33mExecuting nala run command:\x1b[0m \x1b[32m${finalCommand}\x1b[0m\n\x1b[1m\x1b[33mUsing URL:\x1b[0m \x1b[32m${localTestLiveUrl}\x1b[0m\n`);

  const testProcess = spawn(finalCommand, { stdio: 'inherit', shell: true, env: envVariables });

  testProcess.on('close', (code) => {
    // eslint-disable-next-line no-console
    console.log(`Nala tests exited with code ${code}`);
    process.exit(code);
  });
}

if (require.main === module) {
  runNalaTest();
}

module.exports = {
  displayHelp,
  parseArgs,
  getLocalTestLiveUrl,
  buildPlaywrightCommand,
  runNalaTest,
};
