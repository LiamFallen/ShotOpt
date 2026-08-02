import SampleCard from '@/components/SampleCard';
import { CARD_STYLES } from '@/lib/card-styles';

// Radio grid of card designs with live mini previews. Server component —
// selection is a plain radio submitted with the settings form.
export default function StylePicker({ current, accent }) {
  return (
    <div className="style-grid" style={{ '--brand': accent }}>
      {CARD_STYLES.map((s) => (
        <label className="style-option" key={s.key}>
          <input type="radio" name="card_style" value={s.key} defaultChecked={current === s.key} />
          <div className="mini">
            <SampleCard
              styleName={s.key}
              name="Sarah Chen"
              role="Head of Growth"
              text="Trial-to-paid went up 22% after we added the wall."
              color={accent}
            />
          </div>
          <div className="s-name">{s.name}</div>
          <div className="s-blurb">{s.blurb}</div>
        </label>
      ))}
    </div>
  );
}
