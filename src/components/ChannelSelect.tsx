import type { PaymentChannel } from '../types';
import { CHANNEL_LABELS, PAYMENT_CHANNELS } from '../types';

interface ChannelSelectProps {
  channel: PaymentChannel;
  onChange: (channel: PaymentChannel) => void;
}

export function ChannelSelect({ channel, onChange }: ChannelSelectProps) {
  return (
    <label className="field">
      <span>Tipo de dinero</span>
      <select value={channel} onChange={(event) => onChange(event.target.value as PaymentChannel)}>
        {PAYMENT_CHANNELS.map((item) => (
          <option key={item} value={item}>
            {CHANNEL_LABELS[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
