const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder
} = require('discord.js');

const config = require('../../../config');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'closebot',
    description: 'Desactive TOUTES les commandes du bot sauf pour le owner.',

    async execute(client, message, args) {

        if (!message.guild) return;

        if (message.author.id !== config.ownerId) {
            return message.reply("❌ Reserve au proprietaire du bot.");
        }

        const sub = args[0]?.toLowerCase();

        if (!sub || sub === 'status') {
            const disabled = guildConfig.get(message.guild.id, 'botDisabled') || false;

            const container = new ContainerBuilder()
                .setAccentColor(disabled ? 0xED4245 : 0x57F287);

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🔒 Etat du bot\n` +
                    `**Commandes bloquees :** ${disabled ? '🟢 Oui (seul le owner)' : '🔴 Non (tout le monde)'}`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(1).setDivider(true)
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "**Utilisation :**\n" +
                    "`+closebot on` -> bloque tout sauf owner\n" +
                    "`+closebot off` -> redebloque tout\n" +
                    "`+closebot status` -> etat actuel"
                )
            );

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (sub === 'on') {
            guildConfig.set(message.guild.id, 'botDisabled', true);

            const container = new ContainerBuilder()
                .setAccentColor(0xED4245);

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🔒 Bot verrouille\nSeul <@${config.ownerId}> peut maintenant utiliser les commandes.`
                )
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "-# Pour redebloquer : `+closebot off`"
                )
            );

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (sub === 'off') {
            guildConfig.set(message.guild.id, 'botDisabled', false);

            const container = new ContainerBuilder()
                .setAccentColor(0x57F287);

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "## 🔓 Bot redebloque\nLes commandes sont de nouveau accessibles."
                )
            );

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        return message.reply("❌ Utilise `+closebot on`, `+closebot off` ou `+closebot status`.");
    }
};
