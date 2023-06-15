# <div align="center">ChangelogBot</div>
<div align="center">A bot for your changelogs</div>

# How it works

ChangelogBot is a bot who allow you to add changelogs for your projects and see them in a beautiful embed in discord

Example : 

![example4](https://github.com/CreativeTab/ChangelogBot/assets/80975135/3ee753a7-9e2f-4c23-825e-1ce7f729e9c8)

![example3](https://github.com/CreativeTab/ChangelogBot/assets/80975135/3cf99c3c-bb52-4703-865f-fdce081eaf7a)

# Set-up

Clone this repository

Install [node.js](https://nodejs.org/)

Install [discord.js](https://discord.js.org/)

In the config.json file at the root of your folder, enter your bot token, your application id, your guild id and the id of the role who can execute commands of the bot

In the changelog.js and update.js files, enter all of your projects with the template of add_choices :

    { name: 'The name of your project', value: 'your_project_name' },

In the folder changelogs, create a folder for each of your projects. And then copy the template of the folder 'your_project_name'. You need to set an icon.png, and give the color of the embed.

Do not touch the update.json file in commands/changelog/config.

And then, launch the bot with the command :

    npm run start

And enjoy ! 

PS : You must run the update command and send the answer to the bot for the first time before any others to initialise it.

If you have any problems, don't hesitate to open an issue - I'll do my best to help you ! 

# contribute to the development

Do a PR with your changes and I will check and add your code :)
