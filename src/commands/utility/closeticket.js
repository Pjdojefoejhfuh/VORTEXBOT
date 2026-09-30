const {
    PermissionsBitField,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder
} = require('discord.js');

const tickets = require('../../utils/tickets');

module.exports = {
    name: 'closeticket',
    description: 'Ferme le ticket actuel',

    async execute(client, message, args) {

        if (!message.guild) return;

        const ticket = tickets.get(message.channel.id);

        if (!ticket) {
            return message.reply("❌ Ce salon n'est pas un ticket.");
        }

        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member) return;

        const isCreator = member.id === ticket.userId;
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!isCreator && !isAdmin) {
            return message.reply("❌ Seul le createur du ticket ou un admin peut le fermer.");
        }

        const container = new ContainerBuilder().setAccentColor(0xED4245);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                "## 🔒 Fermeture du ticket\nCe salon sera supprime dans **5 secondes**."
            )
        );

        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(1).setDivider(true)
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Ferme par :** ${message.author}\n` +
                `**Ticket #${String(ticket.number).padStart(4, '0')}**`
            )
        );

        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        tickets.update(message.channel.id, { status: 'closed', closedBy: message.author.id });

        setTimeout(() => {
            tickets.remove(message.channel.id);
            message.channel.delete('Ticket ferme via +closeticket').catch(() => {});
        }, 5000);
    }
};
