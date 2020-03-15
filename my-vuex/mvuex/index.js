let Vue;

class Store {
    constructor(options) {

        // 结构配置对象里的属性
        let {state, getters, mutations, actions} = options;

        // 将配置对象里的属性添加到store实例上
        this._mutations = mutations;
        this._actions = actions;
        this._getters = getters;

        // getters里的属性放到computed里，使用computed来做计算属性，
        // 因为getters里的方法需要传一个state参数，而computed是不需要参数的，
        // 所以这里computed外面又套了一个函数
        let computed = {};
        Object.keys(getters).forEach(key => {
            let fn = getters[key];
            computed[key] = function() {
                return fn(state);
            }
        })

        // new 一个Vue实例，让state和computed挂在该实例上，使其响应化
        this._vm = new Vue({
            data: state,
            computed
        })

        // 绑定commit、disptach上下文为store实例
        this.commit = this.commit.bind(this);
        this.dispatch = this.dispatch.bind(this);
    }

    // 当使用this.$store.getters的时候，指向_vm
    get getters() {
        return this._vm
    }

    // 当使用this.$store.state的时候，指向_vm
    get state() {
        return this._vm;
    }

    // 调用commit方法的时候，调用store配置对象里对应的mutations方法
    // 参数1，type -- mutations的类型
    // 参数2，payload -- 载荷
    commit(type, payload) {
        let entry = this._mutations[type];
        entry(this.state, payload);
    }


    // 调用dispatch方法的时候，调用store配置对象里对应的actions方法
    dispatch(type, payload) {
        let entry = this._actions[type];
        entry(this, payload);
    }
}

function install(_Vue) {
    Vue = _Vue;

    // 混入，为了可以在所有Vue实例中通过this.$store访问store实例
    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store;
            }
        }
    });
}

export default {
    Store,
    install
}