import React from "react";
import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
    position: "relative",
    border: "1px solid black",
  },
  backgroundLogo: {
    position: "absolute",
    objectPosition: "center",
    objectFit: "contain",
    top: "30%",
    left: "15%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    height: "50%",
    opacity: 0.2,
    zIndex: -1,
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    textDecoration: "underline",
    color: "#d35400",
  },
  orderInfo: {
    fontSize: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  companyName: {
    fontSize: 10,
    marginBottom: 1,
  },
  serviceNote: {
    fontSize: 10,
    marginBottom: 10,
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },

  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    backgroundColor: "#3498db",
    color: "#fff",
    padding: 5,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#000",
  },
  tableCol: {
    padding: 5,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#000",
  },
  tableCellHeader: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 8,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginVertical: 10,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    textDecoration: "underline",
  },
  tableContainer: {
    border: "1 solid #000",
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderBottom: "1 solid #000",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  cell: {
    borderRight: "1 solid #000",
    padding: 4,
    flexGrow: 1,
    textAlign: "left",
  },
  headerCell: {
    fontWeight: "bold",
    padding: 4,
    flexGrow: 1,
    textAlign: "left",
  },
  feeCell: {
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    // backgroundColor: "#FFFF00",
  },
  totalLabelCell: {
    flex: 2,
    padding: 4,
    fontWeight: "bold",
  },
  totalValueCell: {
    flex: 2,
    padding: 4,
    fontWeight: "bold",
  },
  listItem: {
    fontSize: 9,
    marginLeft: 15,
    marginBottom: 3,
  },
  normalCell: {
    borderRight: "1 solid #000",
    padding: 4,
    textAlign: "left",
    fontWeight: "normal",
  },
  underline: {
    borderTopWidth: 1,
    borderColor: "#000",
    marginTop: 4,
    width: "100%",
  },
  email: {
    color: "#000000",
  },
  link: {
    color: "#1a0dab",
    textDecoration: "underline",
  },
  container: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 10,
    flexDirection: "column",
    gap: 4,
    fontFamily: "Helvetica",
  },
});

// Add this utility function before the QuotationDocument component
const parseHtmlForPdf = (htmlContent) => {
  console.log(htmlContent);
  if (!htmlContent) return null;

  // Parse and convert HTML to React-PDF components
  const elements = [];

  // Simple parsing for basic HTML tags
  const processedContent = htmlContent
    .replace(/<ol>/g, '<ul type="ol">')
    .replace(/<\/ol>/g, "</ul>");
  const listRegex = /<ul( type="ol")?>(.*?)<\/ul>/gs;
  const listItemRegex = /<li>(.*?)<\/li>/gs;

  // Find the last match end position to handle text outside of lists
  let lastMatchEnd = 0;

  // Process lists in the content
  let listMatch;
  while ((listMatch = listRegex.exec(processedContent)) !== null) {
    // Add text before the list if any
    if (listMatch.index > lastMatchEnd) {
      const textBeforeList = processedContent.substring(
        lastMatchEnd,
        listMatch.index,
      );
      if (textBeforeList.trim()) {
        elements.push(
          <Text key={`text-${lastMatchEnd}`} style={styles.listItem}>
            {parseTextWithFormatting(textBeforeList)}
          </Text>,
        );
      }
    }

    const isOrderedList = listMatch[1] === ' type="ol"';
    const listContent = listMatch[2];
    const listItems = [];

    // Extract list items
    let itemMatch;
    let itemIndex = 1;
    while ((itemMatch = listItemRegex.exec(listContent)) !== null) {
      listItems.push(
        <Text key={`item-${itemIndex}`} style={styles.listItem}>
          {isOrderedList ? `${itemIndex}. ` : "• "}
          {parseTextWithFormatting(itemMatch[1])}
        </Text>,
      );
      itemIndex++;
    }

    elements.push(
      <View key={`list-${lastMatchEnd}`} style={{ marginBottom: 5 }}>
        {listItems}
      </View>,
    );

    lastMatchEnd = listMatch.index + listMatch[0].length;
  }

  // Add any remaining text after the last list
  if (lastMatchEnd < processedContent.length) {
    const textAfterLists = processedContent.substring(lastMatchEnd);
    if (textAfterLists.trim() && !textAfterLists.match(/^\s*$/)) {
      elements.push(
        <Text key={`text-end`} style={styles.listItem}>
          {parseTextWithFormatting(textAfterLists)}
        </Text>,
      );
    }
  }

  return elements.length > 0 ? elements : null;
};

// Helper function to parse and format text with styling
const parseTextWithFormatting = (htmlText) => {
  if (!htmlText) return null;

  // Replace <br> and <br/> with newline characters

  let processedText = htmlText
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "\n");

  // Replace common formatting tags with temporary markers
  const formattingMap = {
    strong: {
      start: "§§STRONG_START§§",
      end: "§§STRONG_END§§",
      style: styles.boldText,
    },
    b: {
      start: "§§STRONG_START§§",
      end: "§§STRONG_END§§",
      style: styles.boldText,
    },
    em: {
      start: "§§EM_START§§",
      end: "§§EM_END§§",
      style: styles.italicText,
    },
    i: {
      start: "§§EM_START§§",
      end: "§§EM_END§§",
      style: styles.italicText,
    },
    u: {
      start: "§§U_START§§",
      end: "§§U_END§§",
      style: styles.underlineText,
    },
  };

  // Replace formatting tags with custom markers
  Object.entries(formattingMap).forEach(([tag, { start, end }]) => {
    processedText = processedText
      .replace(new RegExp(`<${tag}>`, "gi"), start)
      .replace(new RegExp(`</${tag}>`, "gi"), end);
  });

  // Remove other remaining HTML tags
  processedText = processedText.replace(/<\/?[^>]+(>|$)/g, "");

  // Build styled Text elements
  const result = [];
  let currentText = "";
  let currentStyles = [];
  let key = 0;

  for (let i = 0; i < processedText.length; i++) {
    // Check if we hit a format marker
    let markerFound = false;

    Object.entries(formattingMap).forEach(([tag, { start, end, style }]) => {
      // Start marker
      if (processedText.substring(i, i + start.length) === start) {
        if (currentText) {
          result.push(
            <Text key={key++} style={Object.assign({}, ...currentStyles)}>
              {currentText}
            </Text>,
          );
          currentText = "";
        }
        currentStyles.push(style);
        i += start.length - 1;
        markerFound = true;
        return;
      }

      // End marker
      if (processedText.substring(i, i + end.length) === end) {
        if (currentText) {
          result.push(
            <Text key={key++} style={Object.assign({}, ...currentStyles)}>
              {currentText}
            </Text>,
          );
          currentText = "";
        }
        currentStyles = currentStyles.filter((s) => s !== style);
        i += end.length - 1;
        markerFound = true;
        return;
      }
    });

    if (!markerFound) {
      if (processedText[i] === "\n") {
        // Handle new line
        if (currentText) {
          result.push(
            <Text key={key++} style={Object.assign({}, ...currentStyles)}>
              {currentText}
            </Text>,
          );
          currentText = "";
        }
        result.push(
          <Text key={key++} style={Object.assign({}, ...currentStyles)}>
            {"\n"}
          </Text>,
        );
      } else {
        currentText += processedText[i];
      }
    }
  }

  // Final leftover text
  if (currentText) {
    result.push(
      <Text key={key++} style={Object.assign({}, ...currentStyles)}>
        {currentText}
      </Text>,
    );
  }

  return result.length > 0 ? result : null;
};

function QuotationTwo({ values }) {
  return (
    <Document>
      <Page size={"A4"} style={styles.page}>
        <Image style={styles.backgroundLogo} src={"/pdfBg.jpg"} fixed />
        <Text style={[styles.subHeader, styles.bold]}>Quotation</Text>
        <View style={styles.orderInfo}>
          <Text>
            <Text style={styles.bold}>Date:</Text>{" "}
            {moment(values?.date).format("DD-MM-YYYY")}
          </Text>
        </View>

        <Text style={styles.companyName}>
          <Text style={styles.bold}>
            Company Name:- {values?.companyName || ""}
          </Text>
        </Text>

        <Text style={styles.serviceNote}>
          We are pleased to offer you the following service(s) as per the terms
          and conditions:
        </Text>

        {/* Details Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>
                  Address of Head Office
                </Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "75%" }]}>
              <Text style={styles.tableCell}>
                {values?.addressOfHeadOffice || ""}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            {/* <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>Standard</Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>{values?.standard || ""}</Text>
            </View> */}
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>No. of Sites - </Text>
                {/* {form.locationNumber} */}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>{values?.noOfSites || 0}</Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>No. of Employees - </Text>
                {/* {form.employeeNumber} */}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>{values?.noOfEmployees || 0}</Text>
            </View>

            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>Certification Board</Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={[styles.tableCell, styles.bold]}>
                {values?.certificationBoard || ""}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>
                  Scope of Registration
                </Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>
                {values?.scopeOfRegistration || ""}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>Entity Type</Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>{values?.entityType || ""}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            {/* <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>Certification Body</Text>
              </Text>
            </View> */}
            {/* <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                {values?.certificationBody || ""}
              </Text>
            </View> */}
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>Certification Board</Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={[styles.tableCell, styles.bold]}>
                {values?.certificationBoard || ""}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>Email</Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={[styles.tableCell, styles.bold]}>
                {values?.email || ""}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>Contact Person Name</Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>
                {values?.contactPersonPrefix} {values?.contactPersonName || ""}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>
                <Text style={{ fontWeight: "bold" }}>Contact Number</Text>
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>{values?.phoneNo || ""}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Audit Fee</Text>
        <AuditFeeTable values={values} />

        {/* <Text style={styles.sectionTitle}>Application Fee Details</Text>
        <ApplicationTable /> */}

        <Text style={styles.serviceNote}>
          Total No. of Surveillance audits will be 2 on intervals of 11 months
          basis. Fee will be {values?.currencyType == "INR" ? "Rs. " : "$ "}{" "}
          {values?.totalFeePerAudit} per audit
        </Text>
        <Text style={styles.sectionTitle}>Note:-</Text>

        <Text style={{ fontSize: 10 }}>
          * The Auditor Days of above table meets the IAF Guidelines{"\n"}* The
          periodic on-going surveillance shall be performed according to
          auditors comment in the report and the purpose of the on-going
          surveillance is to ensure that the customer’s management system is
          maintained and remains effective.{"\n"}* The validity of this
          quotation is 30 days from the date of issue.
        </Text>
        <View style={[styles.section, styles.sectionTitle]}>
          {values?.notes ? parseHtmlForPdf(values?.notes) : <Text></Text>}
        </View>
        {/* Third Page */}
        <View>
          <Text style={styles.sectionTitle}>Documents Required</Text>

          {values?.documentsRequired?.map((item, index) => (
            <Text key={index} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.sectionTitle}>Quoted By: </Text>
          <Text style={styles.sectionTitle}>Accepted By: </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.sectionTitle}>{values?.quotedBy} </Text>
          <Text style={styles.sectionTitle}>{values?.companyName} </Text>
        </View>
        <View style={styles.underline} />
        <Text style={{ fontSize: 8, marginVertical: 8 }}>
          QCCI Boarding, Lodging and travel expenses of Assessment staff will be
          charged at actual. Invoices are raised after each phase of activity
          and are payable immediately on issuance. The Certificate is valid for
          a period of three years or as agreed upon. Man-days and fees for
          surveillance audits are subjected to change in case the requirements
          for certification bodies are revised or there are any changes in size
          or structure of the Auditee’s organization. The Certification will be
          processed according to certification audit contract. After the
          acceptance of this quote, if the applicant wishes to cancel it, the
          advance or any other charges paid shall not be refundable. In the
          event that a client is issued a non-accredited certificate, we shall
          provide an accredited certificate without any extra fees after getting
          the approval from accreditation board. In the event of any dispute the
          jurisdiction shall be in Kolkata court only. Service Tax will be
          charged as applicable, as on the date of invoicing.
        </Text>

        {/* Footer */}
        <View style={styles.container}>
          <Text
            style={[
              styles.companyName,
              { color: "#d35400", fontSize: 13 },
              styles.bold,
            ]}
          >
            QUALITY COMPLIANCE CERTIFICATION INDIA LLP
          </Text>

          <Text>
            <Text style={[styles.companyName, styles.bold]}>Phone No. </Text>
            <Text style={styles.companyName}>+91-9051786886 / 9051786883</Text>
          </Text>

          <Text>
            <Text style={[styles.companyName, styles.bold]}>Email: </Text>
            <Text style={styles.companyName}>
              info@qcci.in / qccicertification@gmail.com
            </Text>
          </Text>

          <Text style={styles.companyName}>
            <Text style={[styles.companyName, styles.bold]}>Head Office: </Text>
            5 CTS - 1246 B Wing Surya Kiran Society, Dahisar East, Near Awadut
            Nagar,{"\n"}
            Mumbai - 400068 MH, India
          </Text>

          <Text style={styles.companyName}>
            <Text style={[styles.companyName, styles.bold]}>
              Branch Office:{" "}
            </Text>
            2ND FLOOR, 23 A, ROYD STREET, P.S, Park St, Kolkata, West Bengal
            700016
          </Text>

          <Text>
            <Text style={[styles.companyName, styles.bold]}>Website: </Text>
            <Link
              style={[styles.companyName, styles.link]}
              src="http://www.qcci.in"
            >
              www.qcci.in
            </Link>
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export const AuditFeeTable = ({ values }) => {
  const gst = (
    values?.auditFeeTable?.reduce((total, row) => total + (row?.fee || 0), 0) *
    0.18
  ).toFixed(2);

  const totalFee = Number(
    values?.auditFeeTable?.reduce(
      (total, row) => total + (Number(row?.fee) || 0),
      0,
    ),
  );

  const gstValue = Number(gst) || 0;

  const grandTotal = values?.gstApplicable
    ? (totalFee + gstValue).toFixed(2)
    : totalFee.toFixed(2);
  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Services</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Services Docs</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Fee</Text>
        {/* <Text style={[styles.headerCell, { flex: 2 }]}>Remarks</Text> */}
      </View>

      {values?.auditFeeTable?.map((row, index) => {
        return (
          <View key={index} style={styles.row}>
            <Text style={[styles.cell, { flex: 2 }]}>
              {row?.services || ""}
            </Text>
            <Text style={[styles.cell, { flex: 2 }]}>
              {row?.serviceDocs || ""}
            </Text>
            <Text style={[styles.cell, { flex: 1 }, styles.feeCell]}>
              {values?.currencyType == "INR" ? "Rs. " : "$ "} {row?.fee || 0}
            </Text>
            {/* <Text style={[styles.cell, { flex: 2 }]}>{row?.remarks || ""}</Text> */}
          </View>
        );
      })}
      {/* GST Row */}
      {values?.gstApplicable && (
        <View style={styles.row}>
          <Text style={styles.totalLabelCell}>GST</Text>
          <Text style={[styles.totalValueCell, { borderLeft: 1 }]}>
            {values?.currencyType == "INR" ? "Rs. " : "$ "} {gst} (18%)
          </Text>
          <Text style={[styles.cell, { flex: 1, borderRight: 0 }]}></Text>
        </View>
      )}

      {/* Total Row */}
      <View style={styles.row}>
        <Text style={styles.totalLabelCell}>Total</Text>
        <Text style={[styles.totalValueCell, { borderLeft: 1 }]}>
          {values?.currencyType == "INR" ? "Rs. " : "$ "} {grandTotal}
        </Text>
        <Text style={[styles.cell, { flex: 1, borderRight: 0 }]}></Text>
      </View>
    </View>
  );
};

export const ApplicationTable = () => (
  <View style={styles.tableContainer}>
    {/* Top Row */}
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 2 }]}>
        <Text>Cheque No.</Text>
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text>Cash</Text>
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text>Online</Text>
      </View>
      <View style={[styles.cell, { flex: 2 }]} />
    </View>

    {/* NEFT Row */}
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 2 }]}>
        <Text>12</Text>
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text>12</Text>
      </View>
      <View style={[styles.normalCell, { flex: 1 }]}>
        <Text>NEFT</Text>
      </View>
      <View style={[styles.normalCell, { flex: 2 }]} />
    </View>

    {/* IMPS Row */}
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 2 }]} />
      <View style={[styles.cell, { flex: 1 }]} />
      <View style={[styles.normalCell, { flex: 1 }]}>
        <Text>IMPS</Text>
      </View>
      <View style={[styles.normalCell, { flex: 2 }]} />
    </View>
  </View>
);

export default QuotationTwo;
