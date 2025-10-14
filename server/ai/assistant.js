const logger = require('../logger');

// AI provider abstraction supporting OpenAI-compatible APIs
async function streamCompletion({ model, messages, openAI, res }) {
  try {
    const stream = await openAI.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.3,
    });

    // Stream as SSE data events
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    logger.error({ err }, 'AI streaming failed');
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'AI request failed' })}\n\n`);
    res.end();
  }
}

module.exports = { streamCompletion };
