Vagrant::Config.run do |config|
  config.vm.host_name = "copper-client"
  config.vm.box ="precise64"
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"
  config.vm.forward_port 5000, 5000
  config.vm.provision :puppet do |puppet|
    puppet.manifests_path = "manifests"
    puppet.module_path = "modules"
  end
end