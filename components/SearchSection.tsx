import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, MapPin, Filter } from "lucide-react";

export function SearchSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Form */}
        <div className="bg-gray-50 rounded-2xl shadow-sm p-6 max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Location Input */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Location (City, State, Area)" 
                className="pl-10 h-12 bg-white"
              />
            </div>

            {/* Property Type */}
            <div className="lg:w-48">
              <Select>
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="lg:w-52">
              <Select>
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50m">₦0 - ₦50M</SelectItem>
                  <SelectItem value="50m-100m">₦50M - ₦100M</SelectItem>
                  <SelectItem value="100m-200m">₦100M - ₦200M</SelectItem>
                  <SelectItem value="200m-500m">₦200M - ₦500M</SelectItem>
                  <SelectItem value="500m-1b">₦500M - ₦1B</SelectItem>
                  <SelectItem value="1b+">₦1B+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filters Button */}
            <Button variant="outline" className="h-12 px-6 bg-white">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Search Button */}
            <Button className="h-12 px-8">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">15,000+</div>
            <div className="text-gray-600">Properties Listed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">2,500+</div>
            <div className="text-gray-600">Active Polls</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}