const Holiday = require('../models/Holiday');

class HolidayService {
  // Create holiday (HR/Admin)
  async createHoliday(holidayData, createdBy) {
    const { name, date, type, description, isOptional, applicableFor } = holidayData;

    // Check if holiday already exists for the same name and year
    const year = new Date(date).getFullYear();
    const existingHoliday = await Holiday.findOne({
      name,
      year
    });

    if (existingHoliday) {
      throw new Error('Holiday with this name already exists for this year');
    }

    const holiday = await Holiday.create({
      name,
      date: new Date(date),
      type: type || 'national',
      description,
      isOptional: isOptional || false,
      applicableFor: applicableFor || ['all'],
      createdBy
    });

    return {
      holiday,
      message: 'Holiday created successfully'
    };
  }

  // Update holiday (HR/Admin)
  async updateHoliday(holidayId, updateData, updatedBy) {
    const holiday = await Holiday.findById(holidayId);

    if (!holiday) {
      throw new Error('Holiday not found');
    }

    // Don't allow changing the year directly
    delete updateData.year;
    delete updateData.createdBy;

    Object.assign(holiday, updateData);
    holiday.updatedBy = updatedBy;

    await holiday.save();

    return {
      holiday,
      message: 'Holiday updated successfully'
    };
  }

  // Delete holiday (HR/Admin)
  async deleteHoliday(holidayId) {
    const holiday = await Holiday.findById(holidayId);

    if (!holiday) {
      throw new Error('Holiday not found');
    }

    await Holiday.findByIdAndDelete(holidayId);

    return {
      message: 'Holiday deleted successfully'
    };
  }

  // Get holidays (with filters)
  async getHolidays(filters = {}) {
    const query = {};

    if (filters.year) {
      query.year = parseInt(filters.year);
    } else {
      // Default to current year
      query.year = new Date().getFullYear();
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.isOptional !== undefined) {
      query.isOptional = filters.isOptional === 'true';
    }

    // Filter based on user role and employment type
    if (filters.userRole === 'employee' && filters.employmentType) {
      query.applicableFor = {
        $in: ['all', filters.employmentType]
      };
    }

    const holidays = await Holiday.find(query)
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')
      .sort('date');

    // Group holidays by month for better display
    const groupedHolidays = holidays.reduce((acc, holiday) => {
      const month = new Date(holiday.date).toLocaleString('default', { month: 'long' });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(holiday);
      return acc;
    }, {});

    return {
      holidays,
      groupedByMonth: groupedHolidays,
      total: holidays.length
    };
  }

  // Get single holiday
  async getHoliday(holidayId) {
    const holiday = await Holiday.findById(holidayId)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');

    if (!holiday) {
      throw new Error('Holiday not found');
    }

    return holiday;
  }

  // Get upcoming holidays
  async getUpcomingHolidays(limit = 5, userRole = null, employmentType = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = {
      date: { $gte: today }
    };

    // Filter based on user role and employment type
    if (userRole === 'employee' && employmentType) {
      query.applicableFor = {
        $in: ['all', employmentType]
      };
    }

    const holidays = await Holiday.find(query)
      .sort('date')
      .limit(limit);

    return holidays;
  }

  // Bulk create holidays (HR/Admin)
  async bulkCreateHolidays(holidaysData, createdBy) {
    const holidays = [];
    const errors = [];

    for (const holidayData of holidaysData) {
      try {
        const holiday = await this.createHoliday(
          { ...holidayData, createdBy },
          createdBy
        );
        holidays.push(holiday.holiday);
      } catch (error) {
        errors.push({
          holiday: holidayData.name,
          error: error.message
        });
      }
    }

    return {
      created: holidays,
      errors,
      message: `${holidays.length} holidays created successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    };
  }

  // Copy holidays from previous year (HR/Admin)
  async copyHolidaysFromYear(fromYear, toYear, createdBy) {
    const holidays = await Holiday.find({ year: fromYear });

    if (holidays.length === 0) {
      throw new Error(`No holidays found for year ${fromYear}`);
    }

    const copiedHolidays = [];

    for (const holiday of holidays) {
      const newDate = new Date(holiday.date);
      newDate.setFullYear(toYear);

      try {
        const newHoliday = await Holiday.create({
          name: holiday.name,
          date: newDate,
          type: holiday.type,
          description: holiday.description,
          isOptional: holiday.isOptional,
          applicableFor: holiday.applicableFor,
          createdBy
        });
        copiedHolidays.push(newHoliday);
      } catch (error) {
        // Skip if holiday already exists
        console.log(`Holiday ${holiday.name} already exists for ${toYear}`);
      }
    }

    return {
      holidays: copiedHolidays,
      message: `${copiedHolidays.length} holidays copied from ${fromYear} to ${toYear}`
    };
  }

  // Get holidays count by year
  async getHolidayStats() {
    const currentYear = new Date().getFullYear();
    const stats = await Holiday.aggregate([
      {
        $match: {
          year: { $gte: currentYear - 2, $lte: currentYear + 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$year',
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.year',
          types: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return stats;
  }
}

module.exports = new HolidayService();
