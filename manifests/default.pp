group {"puppet" : ensure => "present"}
Exec { path => [ "/bin/", "/sbin/" , "/usr/bin/", "/usr/sbin/" ] }

exec {
	'apt-get update':
	command => 'sudo apt-get update --fix-missing'
}

package {
	["python-software-properties",
	 "puppet",
	 "curl",
	 "vim",
	 "git-core",
	 "build-essential",
	 "autoconf",
	 "wget"]:
	ensure => installed,
	require => Exec['apt-get update']
}

exec {
	"ppa_chris-lea":
	creates => "/etc/apt/sources.list.d/chris-lea-node_js-precise.list",
	command => "add-apt-repository -y ppa:chris-lea/node.js",
	user => "root",
	require => Package["python-software-properties"]
}

exec {
	'apt-get update 2':
	command => 'sudo apt-get update --fix-missing',
	require => Exec['ppa_chris-lea']
}

package {
	["nodejs", "npm"]:
	ensure => installed,
	require => Exec['apt-get update 2']
}

exec { 
	"fetch_copper_client":
	cwd => "/home/vagrant",
  command => "git clone git://git.suckerpunch.com/i3-social/copper-client.git",
  creates => "/home/vagrant/copper-client",
  require => Package['git-core'],
  user => "vagrant"
}

exec {
	"npm_install": 
	cwd => '/home/vagrant/copper-client',
	creates => '/home/vagrant/copper-client/node_modules',
	command => 'npm install',
	require => [Exec['fetch_copper_client'], Package['npm']],
	user => "vagrant"
}