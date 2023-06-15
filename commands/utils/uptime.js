const { SlashCommandBuilder } = require('discord.js');
const { performance } = require('perf_hooks');
const { roleId } = require('../../config.json');

function formatUptime(elapsedTimeMs) {
	const realSeconds = elapsedTimeMs / 1000;
	const seconds = Math.floor(realSeconds % 60);
	const minutes = Math.floor((realSeconds % 3600) / 60);
	const hours = Math.floor(realSeconds / 3600);
	const days = Math.floor(realSeconds / 86400);

	return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Stocker le temps de démarrage du processus
const startTime = performance.now();

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription('Uptime')
		.setDefaultMemberPermissions(0),
	category: 'utils',
	async execute(interaction) {

		const { roles } = interaction.member;
		if (roles.cache.has(`${roleId}`)) {
			console.log('all is good');
		} else {
			interaction.reply('you don\'t have enough permissions.');
			return;
		}

		// Obtenir le temps écoulé depuis le démarrage du processus en millisecondes
		const elapsedTimeMs = performance.now() - startTime;

		// Convertir les millisecondes en secondes
		const elapsedTime = formatUptime(elapsedTimeMs);

		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply(`Le Bot est en ligne depuis ${elapsedTime}.`);
	},
};
