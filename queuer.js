module.exports = function (interval = 1000) {
	var _vm = this;
	this.jobs = [];
	this.running = false;
	this.maxlength = 25; // Don't spam the queuer

	this.push = function (func) {
		if (_vm.jobs.length < this.maxlength) {
			this.jobs.push(func);
		}
	};

	this.run = function () {
		if (!_vm.running && _vm.jobs.length > 0) {
			// Run task
			_vm.running = true;
			var task = _vm.jobs.shift();
			
			try {
				task(_vm);
			}
			catch (e) {
				_vm.running = false;
				console.error(e);
			}
		}
	}

	this.finish = function () {
		_vm.running = false;
		_vm.run();
	}

	setInterval(this.run, interval);

	return this;
}