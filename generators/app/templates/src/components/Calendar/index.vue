<!--
 * @Description: 万年历
 * 需求：
 *  支持v-model 绑定一个日期，将当前日期进行初始化为日历。// 此处需求不需要从组件内部更改日期，如果需要在用v-model来进行绑定
 *  支持设置单选多选的配置
 *  支持内部内容插槽配置
 *  待完善。。。

 * events
 * click： 点击单元格的事件
 * getCheckedDates 获取所有选中的日期的数据
 -->
<template>
  <div class="calendarWrap">
    <div class="calendarWeek">
      <div class="weekItem" v-for="day of weekList" :key="day">{{ day }}</div>
    </div>
    <div class="calendarView">
      <div
        :class="{
          dateItem: true,
          selectedDate: item.isSelected,
          noCurMonthDay: !item.isDayInCurMonth
        }"
        v-for="item of calendarViewList"
        :key="item.dateId"
        @click="handleClickDateCell( item)"
        :style="{height: cellHeight}"
      >
        <div class="line"></div>
        <span :class="{ dayText: true }">{{ item.day }}</span>

        <!-- cell显示内容溢出以滚动形式展示 -->
        <div class="contentCell">
        <!-- 以下市插槽内容 -->
        <slot name="dateCell" :cell="item"></slot>
        
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as utils from './utils'
export default {
  name: 'Calendar',
  props: {
    value: {
      type: Date,
      default() {
        return new Date()
      }
    },
    multiChoice: {
      type: Boolean,
      default: false
    },
    cellHeight: {
      type: String,
      default: '92px'
    }
  },
  data() {
    return {
      weekList: ['一', '二', '三', '四', '五', '六', '日'],
      calendarViewList: []
    }
  },
  methods: {},
  computed: {
    getCalendarList() {
      let calendarList = []
      // 1. 根据传递的value值初始化时间
      let { year, month, day } = utils.getNewDate(this.value)
      let currentFirstDay = utils.getDate(year, month, 1)

      //2.  获取当前月第一天星期几，然后循环往后退35天既可以得到所有的日期了。
      // 星期天获取的值是0
      let weekDay = currentFirstDay.getDay()
      let startTime = null
      // 3. 得到当月的1号是星期几，就可以知道上个月的最后几天的日期（在日历上显示的）
      // 如果是星期天需要减去前面六天
      if (weekDay == 0) {
        startTime = currentFirstDay - 6 * 24 * 60 * 60 * 1000
      } else {
        startTime = currentFirstDay - (weekDay - 1) * 24 * 60 * 60 * 1000
      }
      // 4. 遍历去推出剩余天数
      for (let i = 0; i < 35; i++) {
        // 这个是自定义每一个 dateCell 的选项，如果有需要还可以往里继续添加。
        calendarList.push({
          date: new Date(startTime + i * 24 * 60 * 60 * 1000),
          year: new Date(startTime + i * 24 * 60 * 60 * 1000).getFullYear(),
          month: new Date(startTime + i * 24 * 60 * 60 * 1000).getMonth() + 1,
          day: new Date(startTime + i * 24 * 60 * 60 * 1000).getDate()
        })
      }

      return calendarList
    }
  },
  mounted() {},
  methods: {
    // 点击DateCell
    handleClickDateCell(item) {
      // 单选与多选区别是否需要进行排他
      if (!this.multiChoice) {
        this.calendarViewList.forEach((item, index) => {
          this.$set(this.calendarViewList[index], 'isSelected', false)
        })
      }
      // 再次点击进行取反
      this.$set(
        this.calendarViewList[item.index],
        'isSelected',
        !item.isSelected
      )

      // 向外触发一个点击事件
      this.$emit('click', item)
    },
    // 判断是否是当前月日期
    isCurrentMonth(date) {
      // 拿到当前时间去跟日历的时间去匹配看看那些是当前月的日期
      const { year: currentYear, month: currentMonth } = utils.getNewDate(
        this.value
      )
      const { year, month } = utils.getNewDate(date)
      return currentYear === year && currentMonth === month
    },
    // 判断是否是当前时间
    isCurrentDay(date) {
      let {
        year: currentYear,
        month: currentMonth,
        day: currentDay
      } = utils.getNewDate(new Date())
      let { year, month, day } = utils.getNewDate(date)
      return currentYear == year && currentMonth == month && currentDay == day
    },

    // 根据index清除选中状态的方法, 第一个参数为选中状态的index Arr， 第二参数是否全部清除
    clearSelectedStatus(selectedArr = [], isClearAll = false) {
      if (isClearAll) {
        this.calendarViewList.forEach((item, index) => {
          this.$set(this.calendarViewList[index], 'isSelected', false)
        })
      } else {
        Array.isArray(selectedArr) &&
          selectedArr.forEach(item => {
            this.$set(this.calendarViewList[item], 'isSelected', false)
          })
      }
    },

    // 获取所有选中项
    getCheckedDates() {
      const filter = this.calendarViewList.filter(item => item.isSelected)
      return filter
    },
  },

  watch: {
    getCalendarList: {
      deep: true,
      handler(calendarList) {
        // 只要更改了时间就要将其重新zhi'wei
        this.calendarViewList =
          calendarList.length &&
          calendarList.map((item, index) => {
            // 看看日历中的日期是否跟所传入的value的日期是相同的。
            const isDayInCurMonth = this.isCurrentMonth(item.date)
            // 是否是今天
            const isCurrentDay = this.isCurrentDay(item.date)
            // 默认未选中
            const isSelected = false
            // 生成一个 dateId 用作于外部的查找条件和key值的匹配
            const dateId = `dateId-${index}`
            return {
              ...item,
              isDayInCurMonth,
              isCurrentDay,
              isSelected,
              dateId,
              index
            }
          })

      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.calendarWrap {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  color: #333333;
  font-size: 14px;

  // 星期
  .calendarWeek {
    display: flex;
    height: 46px;
    .weekItem {
      padding: 8px 16px 0;
      flex: 1;
      text-align: right;
      font-weight: 600;
    }
  }

  // 日历
  .calendarView {
    width: 100;
    display: flex;
    flex-wrap: wrap;
    .dateItem {
      display: flex;
      flex-direction: column;

      cursor: pointer;
      text-align: right;
      padding: 0px 8px 0;
      width: 14.285%;
      height: 92px;

      background-clip: content-box;
      .line {
        width: 100%;
        height: 4px;
        background-color: rgb(233, 233, 233);
        margin-bottom: 8px;
      }

      .dayText {
        padding-right: 8px;
        user-select:none;
      }

      .contentCell {
        height: calc(100% - 12px - 16px);
        overflow-y: auto;
        direction: rtl; // 先按照自己的需要更改了滚动条为左侧,后期在更改为可配置的形式.
      }

      // 不是当前月的天数
      &.noCurMonthDay {
        pointer-events: none;
        background-image: linear-gradient(
          45deg,
          rgba(0, 0, 0, 0.08) 25%,
          transparent 25%,
          transparent 50%,
          rgba(0, 0, 0, 0.08) 50%,
          rgba(0, 0, 0, 0.08) 75%,
          transparent 75%,
          transparent
        );
        background-size: 20px 20px;
        color: #C3C7CE;
      }

      // 今天的样式

      // 选中日期
      &.selectedDate {
        transition: all .5s;
        background-color: rgba(230, 242, 255) !important;
        .line {
          background-color: rgb(0, 121, 254) !important;
        }
        .dayText {
          color: rgb(26, 135, 254) !important;
        }
      }
    }
  }
}
</style>
