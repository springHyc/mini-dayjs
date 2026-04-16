import React, { Component } from 'react';
import { render } from 'react-dom';
import Hello from './Hello';
import './style.css';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import duration from 'dayjs/plugin/duration';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';

import moment from 'moment';

import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.locale('zh-cn');
dayjs.extend(advancedFormat);
dayjs.extend(dayOfYear);
dayjs.extend(duration);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);

class App extends Component {
    constructor() {
        super();
        this.state = {
            name: 'React',
        };
    }

    line = () => console.log('─'.repeat(56));

    title2(t) {
        console.log();
        this.line();
        console.log(`------${t}------`);
    }

    render() {
        const line = () => console.log('─'.repeat(56));

        function title(t) {
            console.log();
            line();
            console.log(`  ${t}`);
        }

        // const d = dayjs().format('YYYY-MM-DD HH:mm:ss');
        // const d1 = dayjs().startOf('year').format('YYYY-MM-DD HH:mm:ss');
        // const d2 = dayjs().endOf('month').toString();
        // console.log('d2:', d2);
        // console.log(dayjs().endOf('month'));
        // const d3 = dayjs('1999-01-01').fromNow();
        // console.log(d3);
        // console.log(dayjs().isSame('2026-01-01', 'year'));
        // console.log(dayjs().isSame('2026-03-01', 'month'));

        // console.log(dayjs().isBetween('2026-02-19', '2026-10-25', 'month'));
        // console.log(dayjs().isBetween('2026-12-19', '2026-03-25', 'month', '[)'));

        // console.log('-----------------');
        // console.log(dayjs.locale('zh-cn'));
        // console.log('-----------------');
        // console.log(dayjs().format('Q Do k kk X x'));
        // console.log('-----------------');
        console.log(dayjs().dayOfYear());
        // console.log(
        //   dayjs.duration(200).format('YYYY-MM-DD HH:mm:ss'),
        //   ' | ',
        //   dayjs.duration({ minutes: 1 })
        // );
        // console.log('-----------------');
        // console.log(dayjs('2010-04-01').quarter());
        // console.log(dayjs().quarter());
        // console.log(dayjs().week());
        // console.log(dayjs().weekday(3), ' | ', dayjs().weekday());

        // console.log(dayjs.duration({ months: 12 })); // 12个月
        // console.log(dayjs.duration(1000)); // 1s
        // console.log(dayjs.duration(2, 'd'));
        // console.log(dayjs.duration(120, 'm').hours()); // 120分钟 2小时

        // const x = dayjs();
        // const y = dayjs('2026-03-22 19:29:00');
        // console.log(dayjs.duration(x.diff(y)));

        // console.log('----------------------');

        // const m = moment();
        // console.log('m1:', m);
        // m.add(1, 'day');
        // console.log('m2:', m);
        // console.log('----------------------');
        // const d11 = dayjs();
        // console.log('d11:', d11);
        // const d12 = d11.add(1, 'day');
        // console.log('d12:', d12);
        console.log('----------------------');
        console.log(
            'dayjs("2024-01-31").add(1, "M").format("YYYY-MM-DD") ==>',
            dayjs('2024-01-31').add(1, 'M').format('YYYY-MM-DD')
        );
        line();

        title('1. 解析 + 格式化（模板替换 token）');
        const d = dayjs('2024-06-15T14:30:00');
        console.log('dayjs("2024-06-15T14:30:00").format(...)');
        console.log('  =>', d.format('YYYY年MM月DD日 HH:mm'));

        title('2. 不可变：add 返回新实例，原实例不变');
        const a = dayjs('2024-01-10');
        const b = a.add(1, 'M');
        console.log('a =', a.format('YYYY-MM-DD'));
        console.log('b = a.add(1, "M") =>', b.format('YYYY-MM-DD'));

        title('3. 月/年用 Date API（不是固定毫秒）—— 月末 +1 月会「滚动」');
        console.log('dayjs("2024-01-31").add(1, "M").format("YYYY-MM-DD")');
        console.log('  =>', dayjs('2024-01-31').add(1, 'M').format('YYYY-MM-DD'));

        title('4. startOf / endOf —— 聚合统计常用');
        console.log('startOf("M"):', dayjs().startOf('M').format('YYYY-MM-DD HH:mm:ss'));
        console.log('endOf("y"):', dayjs('2024-06-15').endOf('y').format('YYYY-MM-DD HH:mm:ss'));

        title('5. 插件：extend 之后再调用 fromNow');
        // extend(relativeTime);
        const almost2minAgo = dayjs(Date.now() - 119000);
        console.log('    a. almost2minAgo.fromNow() =>', almost2minAgo.fromNow());

        const A = dayjs('2024-06-15 12:00:00');
        const B = dayjs('2024-06-15 12:02:00');
        console.log('    b. A.from(B)（B 为参照，A 早 2 分钟）=>', A.from(B));

        const almost2minLater = dayjs(Date.now() + 119000);
        console.log('    c. almost2minLater.toNow() =>', almost2minLater.toNow());

        title('6. 比较');
        const cmpA = dayjs('2024-01-01');
        const cmpB = dayjs('2024-01-01T23:59:59');
        const sameDay = cmpA.isSame(cmpB, 'd');
        console.log('cmpA = dayjs("2024-01-01")        =>', cmpA.format('YYYY-MM-DD HH:mm:ss'));
        console.log('cmpB = dayjs("2024-01-01T23:59:59") =>', cmpB.format('YYYY-MM-DD HH:mm:ss'));
        console.log('cmpA.isSame(cmpB, "d")（按「天」比较是否同一天）=>', sameDay);
        title('7. 补充示例（边界与其它 API）');
        console.log(
            'dayjs("2024-03-31").subtract(1, "M")',
            '=>',
            dayjs('2024-03-31').subtract(1, 'M').format('YYYY-MM-DD')
        );
        console.log(
            'dayjs("2024-02-29").add(1, "y")',
            '=>',
            dayjs('2024-02-29').add(1, 'y').format('YYYY-MM-DD')
        );
        console.log(
            'dayjs("2024-01-15").add(1, "Q")',
            '=>',
            dayjs('2024-01-15').add(1, 'Q').format('YYYY-MM-DD')
        );
        console.log(
            'dayjs("2024-01-01").isBefore("2024-06-01")',
            '=>',
            dayjs('2024-01-01').isBefore('2024-06-01')
        );
        console.log(
            'dayjs("2024-06-01").isAfter("2024-01-01")',
            '=>',
            dayjs('2024-06-01').isAfter('2024-01-01')
        );
        console.log(
            'dayjs("2024-03-10").isSame(dayjs("2024-03-20"), "M")（是否同月）',
            '=>',
            dayjs('2024-03-10').isSame(dayjs('2024-03-20'), 'M')
        );
        const dRange = dayjs('2024-06-15 12:00:00');
        console.log(
            'dayjs("2024-06-15 12:00:00").startOf("d").format("HH:mm:ss")（当天 0 点）',
            '=>',
            dRange.startOf('d').format('HH:mm:ss')
        );
        console.log(
            'dayjs("2024-06-15 12:00:00").endOf("d").format("HH:mm:ss")（当天最后一刻）',
            '=>',
            dRange.endOf('d').format('HH:mm:ss')
        );
        const sec30Ago = dayjs(Date.now() - 30000);
        console.log('dayjs(Date.now() - 30000).fromNow()（约 30 秒前）', '=>', sec30Ago.fromNow());
        const almost1minAgo = dayjs(Date.now() - 55000);
        console.log(
            'dayjs(Date.now() - 55000).fromNow()（约 55 秒前，relativeTime 阈值内多显示为 1 分钟）',
            '=>',
            almost1minAgo.fromNow()
        );
        console.log(
            'dayjs("2024-01-01").unix()（秒级 Unix 时间戳）',
            '=>',
            dayjs('2024-01-01').unix()
        );

        console.log();
        line();
        console.log('  演示结束（可与 dayjs 官方 API 对照着讲设计取舍）');
        line();
        console.log();

        this.title2('moment 的问题：Mutable（可变对象）');
        const m = moment();
        console.log('m-1:', m.toLocaleString());
        m.add(1, 'day');
        console.log('m-2:', m.toLocaleString());

        return (
            <div>
                <Hello name={this.state.name} />
                <p>Start editing to see some magic happen :)</p>
                <Button type="primary">Add</Button>
            </div>
        );
    }
}

render(<App />, document.getElementById('root'));
