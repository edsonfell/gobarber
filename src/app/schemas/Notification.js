import mongoose from 'mongoose';

// Schema do mongo referente às notificações
const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Number,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    // Esta opção cria os campos created_at, updated_at no mongo
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);
