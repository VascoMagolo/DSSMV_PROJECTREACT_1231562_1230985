export const styles = {
  dropdown: {
    height: 40,
    width: 150,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333333',
  },

}
// Additional styles for history screens
export const stylesHistory = {
  mainContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
    gap: 10,
  },
  itemContainer: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: {
    marginBottom: 5,
  },
  originalText: {
    fontSize: 16,
    fontWeight: "500",
  },
  translatedText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  actionButton: {
    padding: 4,
  }
}