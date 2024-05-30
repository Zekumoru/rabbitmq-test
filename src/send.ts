import amqp from 'amqplib';

const send = async (queue: string, messages: string[]) => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    for (const message of messages) {
      channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      console.log(`[[producer]] Sent: ${message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    await connection.close();
  } catch (error) {
    console.error(error);
  }
};

const messages = process.argv.slice(2);
send('task_queue', messages.length === 0 ? ['Hello world!'] : messages);
