const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
  
    // Copy req.query
    const reqQuery = { ...req.query };
  
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
  
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
  
    // Create query string
    let qp = JSON.stringify(reqQuery);
  
    // Create operators ($gt, $gte, $lt, $lte, $in)
    qp = qp.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
    // Convert string back to JSON
    let queryStr = JSON.parse(qp);
  
    query = model.find(queryStr);
  
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
  
      query.select(fields);
    }
  
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query.sort(sortBy);
    } else {
      query.sort('-createdAt');
    }
  
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
  
    query.skip(startIndex).limit(limit);
  
    if (populate) {
      query.populate(populate);
    }
  
    // Database search based on our query params
    const queryReply = await query;
  
    // Pagination result
    const pagination = {};
  
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.advancedResults = {
      success: true,
      count: queryReply.length,
      pagination,
      data: queryReply,
    };
  
    next();
  };
  
  module.exports = advancedResults;
  