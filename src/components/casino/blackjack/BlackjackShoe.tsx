interface BlackjackShoeProps {
  dealing?: boolean;
}

export function BlackjackShoe({ dealing = false }: BlackjackShoeProps) {
  return (
    <div className={`blackjack-shoe${dealing ? " dealing" : ""}`} aria-hidden>
      <div className="blackjack-shoe-card blackjack-shoe-card-back" />
      <div className="blackjack-shoe-card blackjack-shoe-card-back" />
      <div className="blackjack-shoe-card blackjack-shoe-card-top" />
    </div>
  );
}
