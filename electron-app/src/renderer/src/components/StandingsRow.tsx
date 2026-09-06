import React from 'react';

interface Props {
  rank: number;
  name: string;
  winsId: string;
  lossesId: string;
  tiesId: string;
  pointsId: string;
  values: Record<string, string>;
  onTextChange: (slotId: string, value: string) => void;
}

export const StandingsRow: React.FC<Props> = ({rank, name, winsId, lossesId, tiesId, pointsId, values, onTextChange}) => {
  return (
    <div className="standings-row">
      <span className="standings-row-index">{rank}</span>
      <span className={`standings-row-name ${name ? '' : 'standings-row-name-empty'}`}>{name || '—'}</span>
      <input
        className="standings-stat-input"
        type="text"
        placeholder="W"
        value={values[winsId] ?? ''}
        onChange={(e) => onTextChange(winsId, e.target.value)}
      />
      <input
        className="standings-stat-input"
        type="text"
        placeholder="L"
        value={values[lossesId] ?? ''}
        onChange={(e) => onTextChange(lossesId, e.target.value)}
      />
      <input
        className="standings-stat-input"
        type="text"
        placeholder="T"
        value={values[tiesId] ?? ''}
        onChange={(e) => onTextChange(tiesId, e.target.value)}
      />
      <input
        className="standings-stat-input"
        type="text"
        placeholder="Pts"
        value={values[pointsId] ?? ''}
        onChange={(e) => onTextChange(pointsId, e.target.value)}
      />
    </div>
  );
};
