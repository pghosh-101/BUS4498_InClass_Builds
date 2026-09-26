#!/usr/bin/env Rscript
# SYNTHETIC teaching tool. Requires R; base R only.
# Run:
#   Rscript scripts/check_application_text.R application.txt 500
# Expected output:
#   {"word_count":12,"character_count":78,"max_words":500,"within_limit":true,"placeholder_count":0}
#
# The script reads one text file, counts words and characters, checks an
# optional maximum word count, and flags bracketed placeholders such as
# [NEEDS CONFIRMATION]. It does not access the network or modify files.

args <- commandArgs(trailingOnly = TRUE)

fail <- function(message) {
  cat(message, file = stderr())
  cat("\n", file = stderr())
  quit(status = 2)
}

if (length(args) < 1L || length(args) > 2L) {
  fail("Usage: Rscript check_application_text.R TEXT_FILE [MAX_WORDS]")
}

text_file <- args[[1L]]
if (!file.exists(text_file) || isTRUE(file.info(text_file)$isdir)) {
  fail("Supply a readable text file.")
}

max_words <- Inf
if (length(args) == 2L) {
  parsed_limit <- suppressWarnings(as.numeric(args[[2L]]))
  if (length(parsed_limit) != 1L || !is.finite(parsed_limit) ||
      parsed_limit < 1 || parsed_limit != floor(parsed_limit)) {
    fail("MAX_WORDS must be a positive whole number.")
  }
  max_words <- parsed_limit
}

contents <- tryCatch(
  readLines(text_file, warn = FALSE, encoding = "UTF-8"),
  error = function(error) fail("Could not read the text file as UTF-8.")
)
text <- paste(contents, collapse = "\n")

word_matches <- gregexpr("\\S+", text, perl = TRUE)[[1L]]
word_count <- if (identical(word_matches, -1L)) 0L else length(word_matches)

placeholder_matches <- gregexpr("\\[[^\\]]+\\]", text, perl = TRUE)[[1L]]
placeholder_count <- if (identical(placeholder_matches, -1L)) {
  0L
} else {
  length(placeholder_matches)
}

within_limit <- is.infinite(max_words) || word_count <= max_words
max_words_json <- if (is.infinite(max_words)) "null" else as.character(max_words)

cat(sprintf(
  '{"word_count":%d,"character_count":%d,"max_words":%s,"within_limit":%s,"placeholder_count":%d}\n',
  word_count,
  nchar(text, type = "chars"),
  max_words_json,
  if (within_limit) "true" else "false",
  placeholder_count
))
