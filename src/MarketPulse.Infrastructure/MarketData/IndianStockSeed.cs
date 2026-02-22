namespace MarketPulse.Infrastructure.MarketData;

/// <summary>
/// Fallback list of major NSE stocks when external API does not return Indian symbols.
/// Ticker is stored without exchange suffix; quote API may require RELIANCE.NS format.
/// </summary>
public static class IndianStockSeed
{
    public static readonly IReadOnlyList<(string Ticker, string Name)> NseStocks = new List<(string, string)>
    {
        ("RELIANCE", "Reliance Industries Ltd"),
        ("TCS", "Tata Consultancy Services Ltd"),
        ("HDFCBANK", "HDFC Bank Ltd"),
        ("INFY", "Infosys Ltd"),
        ("ICICIBANK", "ICICI Bank Ltd"),
        ("HINDUNILVR", "Hindustan Unilever Ltd"),
        ("SBIN", "State Bank of India"),
        ("BHARTIARTL", "Bharti Airtel Ltd"),
        ("ITC", "ITC Ltd"),
        ("KOTAKBANK", "Kotak Mahindra Bank Ltd"),
        ("LT", "Larsen & Toubro Ltd"),
        ("AXISBANK", "Axis Bank Ltd"),
        ("ASIANPAINT", "Asian Paints Ltd"),
        ("MARUTI", "Maruti Suzuki India Ltd"),
        ("WIPRO", "Wipro Ltd"),
        ("HCLTECH", "HCL Technologies Ltd"),
        ("TITAN", "Titan Company Ltd"),
        ("SUNPHARMA", "Sun Pharmaceutical Industries Ltd"),
        ("BAJFINANCE", "Bajaj Finance Ltd"),
        ("ULTRACEMCO", "UltraTech Cement Ltd"),
        ("NESTLEIND", "Nestle India Ltd"),
        ("ONGC", "Oil and Natural Gas Corporation Ltd"),
        ("POWERGRID", "Power Grid Corporation of India Ltd"),
        ("NTPC", "NTPC Ltd"),
        ("TATAMOTORS", "Tata Motors Ltd"),
        ("INDUSINDBK", "IndusInd Bank Ltd"),
        ("BAJAJFINSV", "Bajaj Finserv Ltd"),
        ("ADANIPORTS", "Adani Ports and Special Economic Zone Ltd"),
        ("TECHM", "Tech Mahindra Ltd"),
        ("DRREDDY", "Dr. Reddy's Laboratories Ltd"),
    };
}
