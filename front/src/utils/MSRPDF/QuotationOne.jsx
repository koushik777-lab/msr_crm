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
import React from "react";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  headerContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    marginRight: 16,
  },
  logo: {
    width: "100%",
    objectFit: "contain",
  },
  infoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    color: "#F57C00",
    textDecoration: "underline",
    textDecorationColor: "#F57C00",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
  },
  value: {
    fontSize: 10,
  },
  link: {
    fontSize: 10,
    textDecoration: "none",
  },
  pdfTitle: {
    fontSize: 18,
    padding: 10,
    textAlign: "center",
    backgroundColor: "#0097CE",
  },
  bold: {
    fontWeight: "bold",
  },

  container: {
    padding: 10,
    fontSize: 10,
    color: "#000000",
    fontFamily: "Helvetica",
    border: "1 solid #E0E0E0",
  },
  sectionTitle: {
    color: "#F57C00",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "bold",
  },
  tableWrapper: {
    border: "1 solid #BDBDBD",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #BDBDBD",
    backgroundColor: "#F5F5F5",
    fontWeight: "bold",
    borderTop: "1 solid #BDBDBD",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #E0E0E0",
    paddingVertical: 4,
    backgroundColor: "#fff",
  },
  cell: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRight: "1 solid #E0E0E0",
    textAlign: "center",
  },
  lastCell: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: "center",
  },
  boldOrange: {
    color: "#F57C00",
    fontWeight: "bold",
  },
  termLabel: {
    width: "60%",
    justifyContent: "flex-start",
  },
  rightColumn: {
    width: "40%",
    paddingLeft: 10,
    justifyContent: "flex-start",
  },
  bottomNote: {
    backgroundColor: "#FFF3E0",
    textAlign: "center",
    color: "#F57C00",
    fontWeight: "bold",
    fontSize: 11,
    padding: 6,
    marginTop: 6,
    borderTop: "1 solid #F57C00",
  },
});

const widths = ["10%", "35%", "15%", "15%", "10%", "15%"];

function QuotationOne({ values }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.pdfTitle}>Quotation</Text>
        <View style={[styles.contactRow, { padding: 10 }]}>
          <View
            style={{
              flex: 2,
              flexDirection: "column",
            }}
          >
            <View style={styles.contactRow}>
              <Text style={styles.label}>Company Name:</Text>{" "}
              <Text style={styles.value}>{values?.companyName}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.label}>Contact Person Name:</Text>{" "}
              <Text style={styles.value}>{values?.contactPersonName}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.label}>Address:</Text>{" "}
              <Text style={styles.value}>{values?.address}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.label}>Phone No:</Text>{" "}
              <Text style={styles.value}>{values?.phoneNo}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.label}>Email Id:</Text>{" "}
              <Text style={styles.value}>{values?.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.label}>GSTIN:</Text>{" "}
              <Text style={styles.value}>{values?.gstin}</Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.contactRow}>
              <Text style={styles.label}>Date:</Text>{" "}
              <Text style={styles.value}>
                {values?.date && moment(values?.date).format("DD-MM-YYYY")}
              </Text>
            </View>
          </View>
        </View>
        <PriceDescription values={values} />
      </Page>
    </Document>
  );
}

export const Header = () => (
  <View style={styles.headerContainer}>
    {/* Left: Logo */}
    <View style={styles.logoContainer}>
      <Image src="/barcode.jpg" style={styles.logo} />
    </View>

    {/* Right: Title + Contacts */}
    <View style={styles.infoContainer}>
      <Text style={styles.title}>Shop My Barcode</Text>

      <View style={styles.contactRow}>
        <Text style={styles.label}>Number:</Text>
        <Text style={styles.value}>+91 6289218265</Text>
      </View>

      <View style={styles.contactRow}>
        <Text style={styles.label}>Email:</Text>
        <Link src="mailto:info@shopmybarcode.com" style={styles.link}>
          info@shopmybarcode.com
        </Link>
      </View>

      <View style={styles.contactRow}>
        <Text style={styles.label}>Website:</Text>
        <Link src="https://www.shopmybarcode.com" style={styles.link}>
          www.shopmybarcode.com
        </Link>
      </View>
    </View>
  </View>
);

export const PriceDescription = ({ values }) => {
  console.log(values);
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Price Description</Text>

      {/* Table with border */}
      <View style={styles.tableWrapper}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { width: widths[0] }]}>S No.</Text>
          <Text style={[styles.cell, { width: widths[1] }]}>Description</Text>
          <Text style={[styles.cell, { width: widths[2] }]}>Quantity</Text>
          <Text style={[styles.cell, { width: widths[3] }]}>Unit Price</Text>
          {values?.gstApplicable && (
            <Text style={[styles.cell, { width: widths[4] }]}>GST (18%)</Text>
          )}
          <Text style={[styles.lastCell, { width: widths[5] }]}>Amount</Text>
        </View>

        {/* Table Row */}

        {values?.priceDescription.length > 0 &&
          values?.priceDescription.map((item, index) => {
            return (
              <View key={index} style={styles.row}>
                <Text style={[styles.cell, { width: widths[0] }]}>
                  {item?.sno}
                </Text>
                <Text style={[styles.cell, { width: widths[1] }]}>
                  {item?.description}
                </Text>
                <Text style={[styles.cell, { width: widths[2] }]}>
                  {item?.quantity}
                </Text>
                <Text style={[styles.cell, { width: widths[3] }]}>
                  {values?.currencyType == "INR" ? "Rs. " : "$"}{" "}
                  {item?.unitPrice}
                </Text>
                {values?.gstApplicable && (
                  <Text style={[styles.cell, { width: widths[4] }]}>18%</Text>
                )}
                <Text style={[styles.lastCell, { width: widths[5] }]}>
                  {values?.currencyType == "INR" ? "Rs. " : "$"}
                  {item?.amount}
                </Text>
              </View>
            );
          })}
      </View>

      {/* Terms & Conditions + Totals */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: "#ccc",
          borderWidth: 1,
          padding: 10,
          marginTop: 20,
          alignItems: "stretch",
          backgroundColor: "#fff",
        }}
      >
        {/* Left: Terms */}
        <View
          style={{
            flex: 2,
            paddingRight: 15,
            borderRightWidth: 1,
            borderRightColor: "#ccc",
          }}
        >
          <Text
            style={{ fontWeight: "bold", color: "orange", marginBottom: 6 }}
          >
            Terms & Conditions:
          </Text>
          <Text style={{ marginBottom: 4 }}>
            • <Text style={{ fontWeight: "bold" }}>Validity: </Text> This
            quotation is valid for 15 days from the date of issue.
          </Text>
          <Text style={{ marginBottom: 4 }}>
            • <Text style={{ fontWeight: "bold" }}>Payment & Refund: </Text>{" "}
            100% advance payment required. No refund after barcodes are issued.
          </Text>
          <Text style={{ marginBottom: 4 }}>
            • <Text style={{ fontWeight: "bold" }}>Barcode Type & Usage: </Text>{" "}
            We provide private barcodes (853 series) for your product labelling,
            offline sales, and inventory use. These may not work on some online
            marketplaces that require platform-approved barcodes. Check
            requirements before purchase as refunds are not possible after
            issuance.
          </Text>
          <Text style={{ marginBottom: 4 }}>
            • <Text style={{ fontWeight: "bold" }}>General: </Text> Barcodes
            have lifetime validity with no renewal fees. Compatible with Google
            live listing (approval depends on Google policies). All disputes are
            subject to the jurisdiction of our registered office.
          </Text>
        </View>

        {/* Right: Totals */}
        <View
          style={{
            flex: 1,
            paddingLeft: 15,
            justifyContent: "flex-start",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "bold", color: "orange" }}>
              Sub Total
            </Text>
            <Text>
              {values?.currencyType === "INR" ? "Rs. " : "$"}
              {values?.priceDescription.reduce(
                (acc, item) => acc + item?.amount,
                0,
              )}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text>Discount:</Text>
            <Text>
              {values?.currencyType === "INR" ? "Rs. " : "$"} {values?.discount}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={{ fontWeight: "bold", color: "orange" }}>
              Grand Total:
            </Text>
            <Text style={{ fontWeight: "bold", color: "orange" }}>
              {values?.currencyType === "INR" ? "Rs." : "$"}{" "}
              {(
                values?.priceDescription.reduce(
                  (acc, item) => acc + item?.amount,
                  0,
                ) - values?.discount
              ).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Thank You Note */}
      <Text style={styles.bottomNote}>
        Thanks for business with us!!! Please visit us again !!!
      </Text>
    </View>
  );
};

export default QuotationOne;
