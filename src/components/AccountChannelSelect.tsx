import type { AccountCategory, PaymentChannel } from '../types';
import { ACCOUNT_CATEGORIES, ACCOUNT_LABELS, CHANNEL_LABELS, PAYMENT_CHANNELS } from '../types';

interface AccountChannelSelectProps {
  account: AccountCategory;
  channel: PaymentChannel;
  onAccountChange: (account: AccountCategory) => void;
  onChannelChange: (channel: PaymentChannel) => void;
}

export function AccountChannelSelect({
  account,
  channel,
  onAccountChange,
  onChannelChange,
}: AccountChannelSelectProps) {
  return (
    <div className="account-channel-select">
      <label className="field">
        <span>Cuenta</span>
        <select value={account} onChange={(event) => onAccountChange(event.target.value as AccountCategory)}>
          {ACCOUNT_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {ACCOUNT_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Tipo</span>
        <select value={channel} onChange={(event) => onChannelChange(event.target.value as PaymentChannel)}>
          {PAYMENT_CHANNELS.map((item) => (
            <option key={item} value={item}>
              {CHANNEL_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
