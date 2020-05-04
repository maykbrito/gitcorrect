#!/usr/bin/env node

const inquirer = require("inquirer");
const { promisify } = require('util')
const { exec } = require('child_process')
const { CORRECT_NAME, CORRECT_EMAIL, GITHUB_USERNAME } = require('./.env')

const run = promisify(exec)


console.log("\x1b[30m\x1b[43m%s\x1b[0m",`

!!              WARNING                        !!
!! It will replace found author of all commits !!
!!                                             !!
`);

console.log(`
    Greetings, I will help you fix your github 
    activities.
    
    I will prompt some questions ok? Let's go !
`)


async function configureAnswers(answers) {

    const { repository, author } = answers;

    const step1 = `git clone --bare git@github.com:${GITHUB_USERNAME}/${repository}.git`
    const step2 = `cd ${repository}.git`
    const step3 = `git filter-branch --env-filter '
OLD_NAME="${author}"
CORRECT_NAME="${CORRECT_NAME}"
CORRECT_EMAIL="${CORRECT_EMAIL}"

if [ "$GIT_COMMITTER_NAME" = "$OLD_NAME" ]
then
export GIT_COMMITTER_NAME="$CORRECT_NAME"
export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_NAME" = "$OLD_NAME" ]
then
export GIT_AUTHOR_NAME="$CORRECT_NAME"
export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags`
    const step4 = `git push --force --tags origin 'refs/heads/*'`
    const step5 = `cd ../ && rm -rf ${repository}.git`

    const { stdout } = await run(`${step1} && ${step2} && ${step3} && ${step4} && ${step5}`)

    console.log(stdout)
    console.log(`🎉 ALL DONE!`)
    process.exit()
}

inquirer.prompt([
    {
        type: "input",
        name: "repository",
        message: "Github project"
    },
    {
        type: "input",
        name: "author",
        message: "Author to replace"
    }
]).then(configureAnswers)