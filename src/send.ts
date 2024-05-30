import amqp from 'amqplib';

const send = async (queue: string, message: string) => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    console.log(`[[producer]] Sent: ${message}`);

    await new Promise((resolve) => setTimeout(resolve, 500));
    await connection.close();
  } catch (error) {
    console.error(error);
  }
};

send('task_queue', process.argv.slice(2).join(' ') ?? 'Hello world');
