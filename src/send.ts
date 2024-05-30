import amqp from 'amqplib';

const send = async (queue: string, message: string) => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: false,
    });

    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`[[producer]] Sent: ${message}`);

    await new Promise((resolve) => setTimeout(resolve, 500));
    await connection.close();
  } catch (error) {
    console.error(error);
  }
};

send('hello', 'Hello world');
