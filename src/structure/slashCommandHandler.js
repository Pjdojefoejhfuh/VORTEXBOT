const fs = require("fs");
const path = require("path");
const {
    InteractionContextType,
    ApplicationIntegrationType
} = require("discord.js");

function getSlashCommandFiles(dir) {
    let files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    for (const item of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...getSlashCommandFiles(fullPath));
        } else if (item.endsWith(".js")) {
            files.push(fullPath);
        }
    }

    return files;
}

module.exports = (client) => {
    const slashPath = path.join(__dirname, "../slashCommands");

    const slashFiles = getSlashCommandFiles(slashPath);

    for (const file of slashFiles) {
        try {
            const command = require(file);

            if (command.data && command.data.name) {
                command.data
                    .setContexts(
                        InteractionContextType.Guild,
                        InteractionContextType.BotDM,
                        InteractionContextType.PrivateChannel
                    )
                    .setIntegrationTypes(
                        ApplicationIntegrationType.GuildInstall,
                        ApplicationIntegrationType.UserInstall
                    );

                client.slashCommands.set(
                    command.data.name,
                    command
                );

                console.log(
                    `Slash command loaded: ${command.data.name}`
                );
            } else {
                console.log(
                    `❌ Slash command invalid in file ${file}`
                );
            }
        } catch (error) {
            console.error(
                `❌ Impossible de charger la slash command ${file}:`,
                error
            );
        }
    }

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        // === RESTRICTION_SLASH ===
        const _cfg = require('../../config');
        const _gcfg = require('../utils/guildConfig');
        const _isBotOwner = interaction.user.id === _cfg.ownerId;
        const _isGuildOwner = interaction.guild
            ? _gcfg.isBotOwner(interaction.guild.id, interaction.user.id)
            : false;
        if (!_isBotOwner && !_isGuildOwner) {
            return interaction.reply({
                content: "? Vous n'avez pas la permission d'utiliser cette commande.",
                ephemeral: true
            }).catch(() => {});
        }
        // === FIN RESTRICTION_SLASH ===
        // === CHECK_BOT_DISABLED_SLASH ===
        const _disabled = interaction.guild ? _gcfg.get(interaction.guild.id, 'botDisabled') : false;
        if (_disabled && interaction.user.id !== _cfg.ownerId) {
            return interaction.reply({
                content: "?? Le bot est actuellement verrouille. Seul le proprietaire peut l'utiliser.",
                ephemeral: true
            }).catch(() => {});
        }
        // === FIN CHECK_BOT_DISABLED_SLASH ===


        const command = client.slashCommands.get(
            interaction.commandName
        );

        if (!command) {
            console.log(
                `❌ Commande slash inconnue : ${interaction.commandName}`
            );
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(
                `❌ Erreur avec /${interaction.commandName}:`,
                error
            );

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "❌ Une erreur est survenue.",
                    ephemeral: true
                }).catch(() => {});
            } else {
                await interaction.reply({
                    content: "❌ Une erreur est survenue.",
                    ephemeral: true
                }).catch(() => {});
            }
        }
    });
};
