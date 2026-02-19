import React, { useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";

const MSR_LOGO_URL =
  "https://msrassessment.com/wp-content/uploads/2022/11/MSR-ASSESSMENT-NEW-LOGO-e1727962039582.png";

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    position: "relative",
  },
  sectionPage: {
    marginTop: 30,
    marginBottom: 15,
  },
  backgroundLogo: {
    position: "absolute",
    objectPosition: "center",
    objectFit: "contain",
    top: "30%",
    left: "35%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    height: "50%",
    opacity: 0.1,
    zIndex: -1,
  },
  header: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  headerBlue: {
    color: "#3498db",
  },
  headerRegular: {
    color: "#f39c12",
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    textDecoration: "underline",
    color: "#d35400",
  },
  logo: {
    width: 40,
    height: 40,
    marginLeft: 5,
  },
  orderInfo: {
    fontSize: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  companyName: {
    fontSize: 8,
    marginBottom: 1,
  },
  serviceNote: {
    fontSize: 8,
    marginBottom: 10,
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "auto",
    marginBottom: 15,
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    textDecoration: "underline",
  },
  listItem: {
    fontSize: 10,
    marginLeft: 15,
    marginBottom: 3,
  },
  footer: {
    position: "fixed",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: "center",
    color: "#3280cd",
    borderTopWidth: 2,
    borderTopColor: "#f1c40f",
    borderTopStyle: "solid",
    marginTop: "auto",
    paddingTop: 10,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
  },
  signatureBlock: {
    fontSize: 10,
    // width: "40%",
  },
  totalRow: {
    backgroundColor: "#f1f1f1",
    fontWeight: "bold",
  },
  gstRow: {
    fontWeight: "bold",
    color: "#e74c3c",
  },
  totalAmount: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#27ae60",
  },
  // Rotated squares styling doesn't directly apply to PDF the same way
  // We can create simple shapes instead
  decorativeShape: {
    position: "absolute",
    width: "20%",
    height: "20%",
    backgroundColor: "#3280cd",
    opacity: 0.4,
    transform: "rotate(45deg)",
  },
  topLeftShape1: {
    top: -80,
    left: -50,
  },
  topLeftShape2: {
    top: -90,
    left: -50,
    transform: "rotate(60deg)",
  },
  topLeftShape3: {
    top: -90,
    left: -60,
    transform: "rotate(38deg)",
  },
  bottomRightShape1: {
    bottom: -80,
    right: -50,
  },
  bottomRightShape2: {
    bottom: -90,
    right: -50,
    transform: "rotate(60deg)",
  },
  bottomRightShape3: {
    bottom: -90,
    right: -60,
    transform: "rotate(38deg)",
  },
  // Add text formatting styles
  boldText: {
    fontWeight: "bold",
  },
  italicText: {
    fontStyle: "italic",
  },
  underlineText: {
    textDecoration: "underline",
  },
});

const Header = () => (
  <View style={styles.header} fixed>
    <Text>
      <Text style={styles.headerBlue}>M</Text>
      <Text style={styles.headerRegular}>SR </Text>
      Assessment Private Limited
    </Text>
    <Image src={"/msr.png"} style={styles.headerLogo} />
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text>
      2nd Floor, 23A Royd Street, Kolkata – 700016, West Bengal, India.
    </Text>
    <Text style={{ marginTop: 2 }}>
      <Text style={{ fontWeight: "bold" }}>Mobile:</Text> +91-8337004170,
      9073165879
    </Text>
    <Text style={{ marginTop: 2 }}>
      <Text style={{ fontWeight: "bold" }}>Email:</Text> admin@msrassessment.com
    </Text>
    <Text style={{ marginTop: 2 }}>www.msrassessment.com</Text>
  </View>
);

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

// Create the PDF Document component
const QuotationDocument = ({ form, orderNo, viewColumns }) => (
  <Document>
    {/* First Page */}
    <Page size="A4" style={styles.page}>
      <View style={[styles.decorativeShape, styles.topLeftShape1]} fixed />
      <View style={[styles.decorativeShape, styles.topLeftShape2]} fixed />
      <View style={[styles.decorativeShape, styles.topLeftShape3]} fixed />
      <View style={[styles.decorativeShape, styles.bottomRightShape1]} fixed />
      <View style={[styles.decorativeShape, styles.bottomRightShape2]} fixed />
      <View style={[styles.decorativeShape, styles.bottomRightShape3]} fixed />

      <Image style={styles.backgroundLogo} src={"/MSR.png"} fixed />

      <Header />

      <Text style={styles.subHeader}>Quotation</Text>

      <View style={styles.orderInfo}>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Order No:</Text>{" "}
          {`${form?.orderNumber || orderNo}`}
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Date:</Text>{" "}
          {moment(form?.date).format("DD/MM/YYYY")}
        </Text>
      </View>

      <Text style={styles.companyName}>
        <Text style={{ fontWeight: "bold" }}>Company Name:- </Text>
        {form?.company}
      </Text>

      <Text style={styles.serviceNote}>
        We are pleased to offer you the following service(s) as per the terms
        and conditions:
      </Text>

      {/* Details Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, { width: "20%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>Address of Head Office</Text>
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "80%" }]}>
            <Text style={styles.tableCell}>{form?.address}</Text>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>Services</Text>
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "25%" }]}>
            <Text style={styles.tableCell}>{form?.services}</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>No. of Locations - </Text>
              {/* {form.locationNumber} */}
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}> {form.locationNumber} </Text>
          </View>
          <View style={[styles.tableCol, { width: "16%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>No. of Employees - </Text>
              {/* {form.employeeNumber} */}
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "14%" }]}>
            <Text style={styles.tableCell}> {form.employeeNumber}</Text>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={[styles.tableCol, { width: "20%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>Nature of Business</Text>
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "80%" }]}>
            <Text style={styles.tableCell}>{form?.natureOfBusiness}</Text>
          </View>
        </View>

        {/* <View style={styles.tableRow}>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>Product</Text>
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "35%" }]}>
            <Text style={styles.tableCell}>Food</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>Contact No.</Text>
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "35%" }]}>
            <Text style={styles.tableCell}>{form?.number}</Text>
          </View>
        </View> */}

        <View style={styles.tableRow}>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>Person Name</Text>
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "18%" }]}>
            <Text style={styles.tableCell}>
              {form?.namePrefix + " " + form?.name}
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}> Person Number</Text>
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "18%" }]}>
            <Text style={styles.tableCell}>
              {form?.personDetails?.phoneNumber}
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "10%" }]}>
            <Text style={styles.tableCell}>
              <Text style={{ fontWeight: "bold" }}>Email</Text>
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "24%" }]}>
            <Text style={styles.tableCell}>{form?.email}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Fees Structure</Text>

      {/* License Registration Fees Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, { width: "30%" }]}>
            <Text style={styles.tableCellHeader}>Services</Text>
          </View>
          {viewColumns.license.govt && (
            <View style={[styles.tableColHeader, { width: "20%" }]}>
              <Text style={styles.tableCellHeader}>Govt/Others Fees</Text>
            </View>
          )}
          {viewColumns.license.body && (
            <View style={[styles.tableColHeader, { width: "30%" }]}>
              <Text style={styles.tableCellHeader}>Body Fees/Auditor Fees</Text>
            </View>
          )}
          <View
            style={[
              styles.tableColHeader,
              {
                width:
                  viewColumns.license.govt && viewColumns.license.body
                    ? "20%"
                    : viewColumns.license.govt
                      ? "50%"
                      : viewColumns.license.body
                        ? "40%"
                        : "70%",
              },
            ]}
          >
            <Text style={styles.tableCellHeader}>Professional Fees</Text>
          </View>
        </View>

        {form?.licenseRegistrationFees?.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={[styles.tableCol, { width: "30%" }]}>
              <Text style={styles.tableCell}>
                {item?.serviceDocs || item.service}
              </Text>
            </View>
            {viewColumns.license.govt && (
              <View
                style={[
                  styles.tableCol,
                  { width: item.professionalFees ? "20%" : "20%" },
                ]}
              >
                {item.feeType == "Govt./Others" ? (
                  <Text style={styles.tableCell}>
                    {form.currencyType} {item.fees}/-
                  </Text>
                ) : (
                  <Text style={styles.tableCell}>-</Text>
                )}
              </View>
            )}
            {viewColumns.license.body && (
              <View
                style={[
                  styles.tableCol,
                  { width: item.professionalFees ? "30%" : "30%" },
                ]}
              >
                {item.feeType == "Body fees/Auditor Fees" ? (
                  <Text style={styles.tableCell}>
                    {form.currencyType} {item.fees}/-
                  </Text>
                ) : (
                  <Text style={styles.tableCell}>-</Text>
                )}
              </View>
            )}
            <View
              style={[
                styles.tableCol,
                {
                  width:
                    viewColumns.license.govt && viewColumns.license.body
                      ? "20%"
                      : viewColumns.license.govt
                        ? "50%"
                        : viewColumns.license.body
                          ? "40%"
                          : "70%",
                },
              ]}
            >
              <Text style={styles.tableCell}>
                {item.professionalFees
                  ? ` ${form.currencyType}  ${item.professionalFees}/-`
                  : "-"}
              </Text>
            </View>
          </View>
        ))}

        {/* Total calculations */}
        <View style={[styles.tableRow, styles.totalRow]}>
          <View style={[styles.tableCol, { width: "30%" }]}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              Amount
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "70%" }]}>
            <Text style={styles.tableCell}>
              {form.currencyType}{" "}
              {Number(
                Number(
                  form?.licenseRegistrationFees.reduce(
                    (acc, item) =>
                      acc +
                      (Number(item?.fees) || 0) +
                      (Number(item?.professionalFees) || 0),
                    0,
                  ),
                )?.toFixed(2) || 0,
              )?.toLocaleString()}
            </Text>
          </View>
        </View>

        {form?.discount && (
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "30%" }]}>
              <Text style={[styles.tableCell]}>Discount</Text>
            </View>
            <View style={[styles.tableCol, { width: "70%" }]}>
              <Text style={styles.tableCell}>
                {form?.currencyType} {Number(form?.discount)?.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        {form?.discount && (
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "30%" }]}>
              <Text style={[styles.tableCell]}>Gross Amount</Text>
            </View>
            <View style={[styles.tableCol, { width: "70%" }]}>
              <Text style={styles.tableCell}>
                {form?.currencyType}{" "}
                {Number(
                  Number(
                    form?.licenseRegistrationFees.reduce(
                      (acc, item) =>
                        acc +
                        (Number(item?.fees) || 0) +
                        (Number(item?.professionalFees) || 0),
                      0,
                    ) - (form?.discount && form?.discount),
                  )?.toFixed(2) || 0,
                )?.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {form?.isGST && (
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "30%" }]}>
              <Text style={[styles.tableCell, styles.gstRow]}>GST 18%</Text>
            </View>
            <View style={[styles.tableCol, { width: "70%" }]}>
              <Text style={styles.tableCell}>
                {form.currencyType}{" "}
                {Number(
                  Number(
                    (form?.licenseRegistrationFees.reduce(
                      (acc, item) =>
                        acc +
                        (Number(item?.fees) || 0) +
                        (Number(item?.professionalFees) || 0),
                      0,
                    ) -
                      (form?.discount && form?.discount)) *
                      0.18,
                  )?.toFixed(2) || 0,
                )?.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.tableRow}>
          <View style={[styles.tableCol, { width: "30%" }]}>
            <Text style={[styles.tableCell, styles.totalAmount]}>
              Total Payable Amount
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "70%" }]}>
            <Text style={[styles.tableCell, styles.totalAmount]}>
              {form.currencyType}{" "}
              {Number(
                Number(
                  (form?.licenseRegistrationFees.reduce(
                    (acc, item) =>
                      acc +
                      (Number(item?.fees) || 0) +
                      (Number(item?.professionalFees) || 0),
                    0,
                  ) -
                    (form?.discount && form?.discount)) *
                    (form?.isGST ? 1.18 : 1),
                )?.toFixed(2) || 0,
              )?.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Second Page */}
      <View style={styles.sectionPage}>
        <Text style={styles.sectionTitle}>Fees Structure Compliances:</Text>

        {/* Fees Structure Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "30%" }]}>
              <Text style={styles.tableCellHeader}>Services</Text>
            </View>
            {viewColumns.structure.govt && (
              <View style={[styles.tableColHeader, { width: "20%" }]}>
                <Text style={styles.tableCellHeader}>Govt/Others Fees</Text>
              </View>
            )}
            {viewColumns.structure.body && (
              <View style={[styles.tableColHeader, { width: "30%" }]}>
                <Text style={styles.tableCellHeader}>
                  Body Fees/Auditor Fees
                </Text>
              </View>
            )}
            <View
              style={[
                styles.tableColHeader,
                {
                  width:
                    viewColumns.structure.govt && viewColumns.structure.body
                      ? "20%"
                      : viewColumns.structure.govt
                        ? "50%"
                        : viewColumns.structure.body
                          ? "40%"
                          : "70%",
                },
              ]}
            >
              <Text style={styles.tableCellHeader}>Professional Fees</Text>
            </View>
          </View>

          {form?.feeStructureCompliances?.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text style={styles.tableCell}>
                  {item?.serviceDocs || item.service}
                </Text>
              </View>
              {viewColumns.structure.govt && (
                <View
                  style={[
                    styles.tableCol,
                    { width: item.professionalFees ? "20%" : "20%" },
                  ]}
                >
                  <Text style={styles.tableCell}>
                    {item.fees && item.feeType == "Govt./Others"
                      ? `${form.currencyType}  ${item.fees}/-`
                      : "-"}
                  </Text>
                </View>
              )}
              {viewColumns.structure.body && (
                <View
                  style={[
                    styles.tableCol,
                    { width: item.professionalFees ? "30%" : "30%" },
                  ]}
                >
                  <Text style={styles.tableCell}>
                    {item.fees && item.feeType == "Body fees/Auditor Fees"
                      ? `${form.currencyType}  ${item.fees}/-`
                      : "-"}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.tableCol,
                  {
                    width:
                      viewColumns.structure.govt && viewColumns.structure.body
                        ? "20%"
                        : viewColumns.structure.govt
                          ? "50%"
                          : viewColumns.structure.body
                            ? "40%"
                            : "70%",
                  },
                ]}
              >
                <Text style={styles.tableCell}>
                  {item.professionalFees
                    ? `  ${form.currencyType} ${item.professionalFees}/-`
                    : "-"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Note:-</Text>
        {form?.note ? parseHtmlForPdf(form.note) : <Text></Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionSubtitle}>ACCOUNT DETAILS</Text>
        <Text style={[styles.listItem, { marginLeft: 0, marginTop: 5 }]}>
          {form?.isGST
            ? form?.accountDetails?.withGST
            : form?.accountDetails?.withoutGST}
        </Text>
      </View>

      {/* <View style={styles.section}>
        <Text style={styles.sectionSubtitle}>Payment Mode:</Text>
        <Text style={styles.listItem}>1. 75% Consultancy Fee in advance.</Text>
        <Text style={styles.listItem}>2. 100% Govt Fee in advance.</Text>
        <Text style={styles.listItem}>
          3. Balance 25% Consultancy Fee after Certification.
        </Text>
      </View> */}

      {/* Third Page */}
      <View style={styles.sectionPage}>
        <Text style={styles.sectionTitle}>
          {form?.licenseRegistrationFees
            ?.map((item) => item && (item.serviceDocs || item.service))
            .join(", ")}{" "}
          Documents Required
        </Text>

        {/* {form?.licenseRegistrationFees?.map((item) => (
          <Text
            key={item.service}
            style={[
              styles.listItem,
              {
                fontWeight: "bold",
                marginLeft: 0,
                marginTop: 10,
                textDecoration: "underline",
              },
            ]}
          >
            {item.service}:
          </Text>
        ))} */}

        {form?.documentsRequired?.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </View>

      <View style={styles.signatureSection}>
        <View style={styles.signatureBlock}>
          <Text style={{ fontWeight: "bold" }}>Quoted by:</Text>
          <Text style={{ fontWeight: "bold" }}>{form?.quotedBy}</Text>
        </View>
        <View style={styles.signatureBlock}>
          <Text style={{ fontWeight: "bold" }}>Accepted by:</Text>
          <Text style={{ fontWeight: "bold" }}>
            {form?.namePrefix + " " + form?.name}
          </Text>
        </View>
      </View>

      <Footer />
    </Page>
  </Document>
);

// Component to display PDF generation link
const QuotationPDFLink = ({ form }) => {
  console.log("QuotationPDFLink form: ", form);
  const viewColumns = {
    license: {
      govt: form.licenseRegistrationFees
        .map((v) => v.feeType)
        .includes("Govt./Others"),
      body: form.licenseRegistrationFees
        .map((v) => v.feeType)
        .includes("Body fees/Auditor Fees"),
    },
    structure: {
      govt: form.licenseRegistrationFees
        .map((v) => v.feeType)
        .includes("Govt./Others"),
      body: form.licenseRegistrationFees
        .map((v) => v.feeType)
        .includes("Body fees/Auditor Fees"),
    },
  };
  return (
    <PDFDownloadLink
      document={<QuotationDocument form={form} viewColumns={viewColumns} />}
      fileName={`${form?.name || "quotation"}-${moment().format("DD-MM-YYYY")}.pdf`}
      style={{
        padding: "10px 15px",
        backgroundColor: "#3498db",
        color: "white",
        borderRadius: "5px",
        textDecoration: "none",
        display: "inline-block",
        cursor: "pointer",
      }}
    >
      {({ blob, url, loading, error }) =>
        loading ? "Generating PDF..." : "Download Quotation"
      }
    </PDFDownloadLink>
  );
};

// Function to generate and download the PDF
const handleGenerateQuotation = async (
  form,
  user,
  isAgent,
  isSalesManager,
  isBackend,
  editMode,
  viewMode,
  quotationID,
) => {
  try {
    console.log(
      "Generating quotation with form data:",
      form,
      isAgent,
      isSalesManager,
    );
    // return;
    let orderNo = "";

    const getOrderNo = async () => {
      // try {
      const {
        data: {
          QuotationNumber: { number },
        },
      } = await axios.get(`${API_URI}/quotationNumber`, getHeaders());
      orderNo = number;
      // } catch (error) {
      // console.error("Error getting order number", error);
      // }
    };
    const saveQuotation = async () => {
      // try {
      const {
        data: { newQuotation },
      } = await axios.post(
        `${API_URI}/quotation`,
        {
          agentName: isAgent
            ? user?.name
            : isSalesManager
              ? "Sales Manager"
              : isBackend
                ? "Backend"
                : "admin",
          companyName: form?.company,
          orderNumber: `MSR/${moment(Date.now()).format("DDMM")}/${orderNo}`,
          personDetails: {
            name: form?.name,
            phoneNumber: form?.number,
          },
          ...form,
        },
        getHeaders(),
      );
      console.log(newQuotation);
      // } catch (error) {
      //   console.error("Error getting order number", error);
      // }
    };

    const UpdateQuotation = async () => {
      const {
        data: { updatedQuotation },
      } = await axios.put(
        `${API_URI}/quotation/${quotationID}`,
        form,
        getHeaders(),
      );
      console.log(updatedQuotation);
    };

    console.log(editMode);
    if (!viewMode) {
      editMode == -1 && (await getOrderNo());
      editMode == -1 && (await saveQuotation());

      editMode != -1 && (await UpdateQuotation());
    }
    // try {
    // In React.js, the PDF generation happens in the QuotationPDFLink component
    // This function is kept for compatibility, but the actual PDF generation
    // is handled by @react-pdf/renderer via the PDFDownloadLink
    console.log(form);
    const viewColumns = {
      license: {
        govt: form.licenseRegistrationFees
          .map((v) => v.feeType)
          .includes("Govt./Others"),
        body: form.licenseRegistrationFees
          .map((v) => v.feeType)
          .includes("Body fees/Auditor Fees"),
      },
      structure: {
        govt: form.licenseRegistrationFees
          .map((v) => v.feeType)
          .includes("Govt./Others"),
        body: form.licenseRegistrationFees
          .map((v) => v.feeType)
          .includes("Body fees/Auditor Fees"),
      },
    };
    const blob = await pdf(
      <QuotationDocument
        orderNo={`MSR/${moment(Date.now()).format("DDMM")}/${orderNo}`}
        form={form}
        viewColumns={viewColumns}
      />,
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    toast.success("Quotation generated successfully");
    return true;
  } catch (error) {
    console.error("Error generating quotation:", error);
    toast.error(
      editMode ? "Error updating quotation" : "Error generating quotation",
    );
    return false;
  }
};

export { handleGenerateQuotation, QuotationPDFLink, QuotationDocument };
