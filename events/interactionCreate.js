const { convertFile } = require('@/lib/helpers')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isSelectMenu()) {
      if (interaction.customId === 'file-type') {
        interaction.deferReply()
        try {
          await interaction.channel.messages.edit(interaction.message, {
            content: 'Converting your file...',
            components: []
          })
          const originalMessageId = interaction.message.reference.messageId
          const originalMessage = await interaction.channel.messages.fetch(originalMessageId)
          const attachment = originalMessage.attachments.values().next().value
          const payload = {
            source: {
              kind: attachment.contentType?.split('/')[0],
              url: attachment.url,
              name: attachment.name
            },
            target: {
              type: interaction.values[0]
            }
          }
          const { Payload } = await convertFile(payload)
          const { result } = JSON.parse(Payload)
          await interaction.channel.messages.edit(interaction.message, {
            content: `You can download your file at: ${result.Location}`
          })
          interaction.deleteReply()
        } catch {
          const reply = {
            content: 'There was an error while executing this command!',
            ephemeral: true
          }
          if (interaction.deferred) {
            await interaction.editReply(reply)
          } else {
            await interaction.reply(reply)
          }
        }
      }
    } else if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) return

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
        console.error(error.response)
        const reply = {
          content: 'There was an error while executing this command!',
          ephemeral: true
        }
        if (interaction.deferred) {
          await interaction.editReply(reply)
        } else {
          await interaction.reply(reply)
        }
      }
    }
  }
}
