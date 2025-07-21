class Comment {
  constructor (string_comment, annotation) {
    string_comment != null && string_comment != '' ? this.string_comment = string_comment : ''
    annotation != null ? this.annotation = annotation : ''
  }
}
exports.Comment = Comment
