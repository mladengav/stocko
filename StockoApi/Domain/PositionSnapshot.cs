namespace StockoApi.Domain
{
    public readonly record struct Position(string Symbol, int Quantity);

    public readonly record struct PositionSnapshot(Position Position, decimal TtmDivs)
    {
        public static PositionSnapshot From(Position position, TickerSnapshot? ticker)
        {
            return new PositionSnapshot(position, ticker?.TtmDivs * position.Quantity ?? 0m);
        }
    }
}
