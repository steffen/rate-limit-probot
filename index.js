const commands = require('probot-commands')
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  commands(app, 'debug', async (context, command) => {
    let issueComment

    switch (command.arguments) {
      case 'rate_limit':
        const rateLimit = await context.github.rateLimit.get()

        issueComment = context.issue({ body: '```\n' + JSON.stringify(rateLimit.data, null, 2) + '\n```' })
        await context.github.issues.createComment(issueComment)
        break
      case 'installation_id':
        const installationId = context.payload.installation.id

        issueComment = context.issue({ body: `Installation ID: **${installationId}**` })
        await context.github.issues.createComment(issueComment)
        break
      case 'graphql_query':
        const issueNodeId = context.payload.issue.node_id

        const graphQLQuery = `
          query ($nodeId: ID!) { 
            node(id: $nodeId) {
              ... on Issue {
                id
                number
                title
              }
            }
            rateLimit {
              limit
              cost
              remaining
              resetAt
            }
          }
        ` 

        const responseData = await context.github.query(graphQLQuery, {
          nodeId: issueNodeId
        })

        issueComment = context.issue({ body: '```\n' + JSON.stringify(responseData, null, 2) + '\n```' })
        await context.github.issues.createComment(issueComment)
        break
    }

    return
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
